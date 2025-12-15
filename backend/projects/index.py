import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления проектами: создание, получение списка, обновление, получение версий
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            project_id = params.get('id')
            
            if project_id:
                cur.execute(
                    "SELECT * FROM projects WHERE id = %s",
                    (project_id,)
                )
                project = cur.fetchone()
                
                if not project:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Project not found'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "SELECT * FROM project_versions WHERE project_id = %s ORDER BY version_number DESC",
                    (project_id,)
                )
                versions = cur.fetchall()
                
                result = dict(project)
                result['versions'] = [dict(v) for v in versions]
                result['created_at'] = result['created_at'].isoformat() if result.get('created_at') else None
                result['updated_at'] = result['updated_at'].isoformat() if result.get('updated_at') else None
                
                for v in result['versions']:
                    v['created_at'] = v['created_at'].isoformat() if v.get('created_at') else None
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps(result),
                    'isBase64Encoded': False
                }
            else:
                if user_id:
                    cur.execute(
                        "SELECT id, name, description, prompt, status, thumbnail_url, created_at, updated_at FROM projects WHERE user_id = %s ORDER BY updated_at DESC LIMIT 50",
                        (user_id,)
                    )
                else:
                    cur.execute(
                        "SELECT id, name, description, prompt, status, thumbnail_url, created_at, updated_at FROM projects WHERE user_id IS NULL ORDER BY updated_at DESC LIMIT 50"
                    )
                projects = cur.fetchall()
                
                result = []
                for p in projects:
                    project_dict = dict(p)
                    project_dict['created_at'] = project_dict['created_at'].isoformat() if project_dict.get('created_at') else None
                    project_dict['updated_at'] = project_dict['updated_at'].isoformat() if project_dict.get('updated_at') else None
                    result.append(project_dict)
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'projects': result}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', 'Новый проект')
            description = body_data.get('description', '')
            prompt = body_data.get('prompt', '')
            code = body_data.get('code', '')
            status = body_data.get('status', 'draft')
            
            cur.execute(
                """
                INSERT INTO projects (name, description, prompt, current_code, status, user_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (name, description, prompt, code, status, user_id)
            )
            
            project_id = cur.fetchone()['id']
            
            cur.execute(
                """
                INSERT INTO project_versions (project_id, version_number, code, changes_description)
                VALUES (%s, %s, %s, %s)
                """,
                (project_id, 1, code, 'Начальная версия')
            )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'project_id': project_id,
                    'message': 'Project created successfully'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            project_id = body_data.get('id')
            if not project_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Project ID is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT * FROM projects WHERE id = %s", (project_id,))
            project = cur.fetchone()
            
            if not project:
                return {
                    'statusCode': 404,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Project not found'}),
                    'isBase64Encoded': False
                }
            
            name = body_data.get('name', project['name'])
            description = body_data.get('description', project['description'])
            code = body_data.get('code')
            status = body_data.get('status', project['status'])
            changes_description = body_data.get('changes_description', 'Обновление проекта')
            
            cur.execute(
                """
                UPDATE projects 
                SET name = %s, description = %s, status = %s, current_code = COALESCE(%s, current_code), updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (name, description, status, code, project_id)
            )
            
            if code:
                cur.execute(
                    "SELECT COALESCE(MAX(version_number), 0) + 1 as next_version FROM project_versions WHERE project_id = %s",
                    (project_id,)
                )
                next_version = cur.fetchone()['next_version']
                
                cur.execute(
                    """
                    INSERT INTO project_versions (project_id, version_number, code, changes_description)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (project_id, next_version, code, changes_description)
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Project updated successfully'
                }),
                'isBase64Encoded': False
            }
        
        else:
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