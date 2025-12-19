import json
import os
import hashlib
import secrets
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlencode
import urllib.request

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )

def hash_password(password: str) -> str:
    """Хеширование пароля с использованием SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Генерация случайного токена"""
    return secrets.token_urlsafe(32)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для авторизации: регистрация, вход, проверка токена
    """
    method: str = event.get('httpMethod', 'GET')
    path_params = event.get('queryStringParameters') or {}
    action = path_params.get('action', 'login')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if action == 'register':
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                name = body_data.get('name', '').strip()
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                if len(password) < 6:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Пароль должен быть минимум 6 символов'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                
                cur.execute(
                    "INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s) RETURNING id, email, name, role",
                    (email, password_hash, name or email.split('@')[0], 'user')
                )
                user = cur.fetchone()
                conn.commit()
                
                token = generate_token()
                
                return {
                    'statusCode': 201,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'name': user['name'],
                            'role': user.get('role', 'user')
                        },
                        'token': token,
                        'message': 'Регистрация успешна'
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'login':
                email = body_data.get('email', '').strip().lower()
                password = body_data.get('password', '')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                
                cur.execute(
                    "SELECT id, email, name, avatar_url, role FROM users WHERE email = %s AND password_hash = %s",
                    (email, password_hash)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s",
                    (user['id'],)
                )
                conn.commit()
                
                token = generate_token()
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'name': user['name'],
                            'avatar_url': user['avatar_url'],
                            'role': user.get('role', 'user')
                        },
                        'token': token,
                        'message': 'Вход выполнен успешно'
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            if action == 'google_auth_url':
                client_id = os.environ.get('GOOGLE_CLIENT_ID')
                if not client_id:
                    return {
                        'statusCode': 500,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Google OAuth не настроен'}),
                        'isBase64Encoded': False
                    }
                
                redirect_uri = 'https://websynapse.ru/auth/google/callback'
                params = {
                    'client_id': client_id,
                    'redirect_uri': redirect_uri,
                    'response_type': 'code',
                    'scope': 'openid email profile',
                    'access_type': 'offline',
                    'prompt': 'consent'
                }
                
                auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'auth_url': auth_url}),
                    'isBase64Encoded': False
                }
            
            elif action == 'google_callback':
                code = path_params.get('code')
                if not code:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Код авторизации не предоставлен'}),
                        'isBase64Encoded': False
                    }
                
                client_id = os.environ.get('GOOGLE_CLIENT_ID')
                client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
                
                if not client_id or not client_secret:
                    return {
                        'statusCode': 500,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Google OAuth не настроен'}),
                        'isBase64Encoded': False
                    }
                
                token_data = {
                    'code': code,
                    'client_id': client_id,
                    'client_secret': client_secret,
                    'redirect_uri': 'https://websynapse.ru/auth/google/callback',
                    'grant_type': 'authorization_code'
                }
                
                token_request = urllib.request.Request(
                    'https://oauth2.googleapis.com/token',
                    data=urlencode(token_data).encode(),
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )
                
                try:
                    with urllib.request.urlopen(token_request) as response:
                        token_response = json.loads(response.read().decode())
                    
                    access_token = token_response.get('access_token')
                    
                    userinfo_request = urllib.request.Request(
                        'https://www.googleapis.com/oauth2/v2/userinfo',
                        headers={'Authorization': f'Bearer {access_token}'}
                    )
                    
                    with urllib.request.urlopen(userinfo_request) as response:
                        user_info = json.loads(response.read().decode())
                    
                    email = user_info.get('email', '').strip().lower()
                    name = user_info.get('name', '')
                    avatar_url = user_info.get('picture', '')
                    google_id = user_info.get('id', '')
                    
                    cur.execute("SELECT id, email, name, avatar_url, role FROM users WHERE email = %s", (email,))
                    user = cur.fetchone()
                    
                    if user:
                        cur.execute(
                            "UPDATE users SET last_login = CURRENT_TIMESTAMP, google_id = %s, avatar_url = %s WHERE id = %s",
                            (google_id, avatar_url, user['id'])
                        )
                        conn.commit()
                    else:
                        cur.execute(
                            "INSERT INTO users (email, name, avatar_url, google_id, role) VALUES (%s, %s, %s, %s, %s) RETURNING id, email, name, avatar_url, role",
                            (email, name, avatar_url, google_id, 'user')
                        )
                        user = cur.fetchone()
                        conn.commit()
                    
                    token = generate_token()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'success': True,
                            'user': {
                                'id': user['id'],
                                'email': user['email'],
                                'name': user['name'],
                                'avatar_url': user.get('avatar_url'),
                                'role': user.get('role', 'user')
                            },
                            'token': token,
                            'message': 'Вход через Google выполнен успешно'
                        }),
                        'isBase64Encoded': False
                    }
                except Exception as google_error:
                    return {
                        'statusCode': 500,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': f'Ошибка авторизации Google: {str(google_error)}'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'verify':
                headers = event.get('headers') or {}
                token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
                
                if not token:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Токен не предоставлен'}),
                        'isBase64Encoded': False
                    }
                
                user_id = path_params.get('user_id')
                if not user_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'user_id обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT id, email, name, avatar_url, role, created_at, last_login FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Пользователь не найден'}),
                        'isBase64Encoded': False
                    }
                
                user_dict = dict(user)
                user_dict['created_at'] = user_dict['created_at'].isoformat() if user_dict.get('created_at') else None
                user_dict['last_login'] = user_dict['last_login'].isoformat() if user_dict.get('last_login') else None
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'success': True,
                        'user': user_dict
                    }),
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