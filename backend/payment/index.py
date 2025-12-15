import json
import os
import hashlib
from typing import Dict, Any
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )

def generate_robokassa_signature(merchant_login: str, amount: str, invoice_id: str, password: str) -> str:
    """Генерация подписи для Robokassa"""
    signature_string = f"{merchant_login}:{amount}:{invoice_id}:{password}"
    return hashlib.md5(signature_string.encode()).hexdigest()

def verify_robokassa_signature(amount: str, invoice_id: str, signature: str, password: str) -> bool:
    """Проверка подписи от Robokassa"""
    expected = hashlib.md5(f"{amount}:{invoice_id}:{password}".encode()).hexdigest()
    return signature.lower() == expected.lower()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления платежами через Robokassa и подписками
    Поддержка: подписки Light/Pro, покупка токенов
    """
    method: str = event.get('httpMethod', 'GET')
    path_params = event.get('queryStringParameters') or {}
    action = path_params.get('action', 'create_payment')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        headers = event.get('headers') or {}
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        merchant_login = os.environ.get('ROBOKASSA_MERCHANT_LOGIN', 'demo')
        password1 = os.environ.get('ROBOKASSA_PASSWORD1', 'password1')
        password2 = os.environ.get('ROBOKASSA_PASSWORD2', 'password2')
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if action == 'create_payment':
                if not user_id:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Требуется авторизация'}),
                        'isBase64Encoded': False
                    }
                
                payment_type = body_data.get('payment_type')
                tokens_amount = body_data.get('tokens_amount', 0)
                
                prices = {
                    'subscription_light': 999,
                    'subscription_pro': 1999,
                    'tokens': tokens_amount
                }
                
                if payment_type not in prices and payment_type != 'tokens':
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Неверный тип платежа'}),
                        'isBase64Encoded': False
                    }
                
                amount = prices.get(payment_type, tokens_amount)
                
                if amount <= 0:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Сумма должна быть больше 0'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    """
                    INSERT INTO payments (user_id, payment_type, amount, tokens_amount, status)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (user_id, payment_type, amount, tokens_amount, 'pending')
                )
                payment_id = cur.fetchone()['id']
                conn.commit()
                
                invoice_id = str(payment_id)
                signature = generate_robokassa_signature(
                    merchant_login,
                    str(amount),
                    invoice_id,
                    password1
                )
                
                cur.execute(
                    "UPDATE payments SET robokassa_invoice_id = %s, robokassa_signature = %s WHERE id = %s",
                    (invoice_id, signature, payment_id)
                )
                conn.commit()
                
                payment_url = f"https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin={merchant_login}&OutSum={amount}&InvId={invoice_id}&SignatureValue={signature}&Culture=ru"
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'payment_id': payment_id,
                        'payment_url': payment_url,
                        'amount': amount,
                        'invoice_id': invoice_id
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'result':
                out_sum = body_data.get('OutSum')
                inv_id = body_data.get('InvId')
                signature = body_data.get('SignatureValue')
                
                if not verify_robokassa_signature(out_sum, inv_id, signature, password2):
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Неверная подпись'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT * FROM payments WHERE robokassa_invoice_id = %s",
                    (inv_id,)
                )
                payment = cur.fetchone()
                
                if not payment:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Платеж не найден'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "UPDATE payments SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    ('completed', payment['id'])
                )
                
                if payment['payment_type'] in ['subscription_light', 'subscription_pro']:
                    plan_type = payment['payment_type'].replace('subscription_', '')
                    expires_at = datetime.now() + timedelta(days=30)
                    
                    tokens = 50000 if plan_type == 'light' else 200000
                    
                    cur.execute(
                        """
                        INSERT INTO subscriptions (user_id, plan_type, tokens_balance, expires_at, status)
                        VALUES (%s, %s, %s, %s, %s)
                        RETURNING id
                        """,
                        (payment['user_id'], plan_type, tokens, expires_at, 'active')
                    )
                    subscription_id = cur.fetchone()['id']
                    
                    cur.execute(
                        "UPDATE payments SET subscription_id = %s WHERE id = %s",
                        (subscription_id, payment['id'])
                    )
                
                elif payment['payment_type'] == 'tokens':
                    cur.execute(
                        """
                        SELECT id FROM subscriptions 
                        WHERE user_id = %s AND status = 'active' 
                        ORDER BY created_at DESC LIMIT 1
                        """,
                        (payment['user_id'],)
                    )
                    subscription = cur.fetchone()
                    
                    if subscription:
                        cur.execute(
                            """
                            UPDATE subscriptions 
                            SET tokens_balance = tokens_balance + %s, updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s
                            """,
                            (payment['tokens_amount'], subscription['id'])
                        )
                    else:
                        cur.execute(
                            """
                            INSERT INTO subscriptions (user_id, plan_type, tokens_balance, status)
                            VALUES (%s, %s, %s, %s)
                            """,
                            (payment['user_id'], 'tokens', payment['tokens_amount'], 'active')
                        )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': f"OK{inv_id}",
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            if action == 'subscription':
                if not user_id:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Требуется авторизация'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    """
                    SELECT * FROM subscriptions 
                    WHERE user_id = %s AND status = 'active'
                    ORDER BY created_at DESC LIMIT 1
                    """,
                    (user_id,)
                )
                subscription = cur.fetchone()
                
                if not subscription:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'has_subscription': False,
                            'tokens_balance': 0
                        }),
                        'isBase64Encoded': False
                    }
                
                sub_dict = dict(subscription)
                sub_dict['started_at'] = sub_dict['started_at'].isoformat() if sub_dict.get('started_at') else None
                sub_dict['expires_at'] = sub_dict['expires_at'].isoformat() if sub_dict.get('expires_at') else None
                sub_dict['created_at'] = sub_dict['created_at'].isoformat() if sub_dict.get('created_at') else None
                sub_dict['updated_at'] = sub_dict['updated_at'].isoformat() if sub_dict.get('updated_at') else None
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'has_subscription': True,
                        'subscription': sub_dict
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'payments':
                if not user_id:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Требуется авторизация'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    """
                    SELECT id, payment_type, amount, status, tokens_amount, created_at 
                    FROM payments 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC LIMIT 50
                    """,
                    (user_id,)
                )
                payments = cur.fetchall()
                
                result = []
                for p in payments:
                    payment_dict = dict(p)
                    payment_dict['created_at'] = payment_dict['created_at'].isoformat() if payment_dict.get('created_at') else None
                    result.append(payment_dict)
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'payments': result}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
