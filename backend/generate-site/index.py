import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Генерация HTML/CSS/JS кода сайта из текстового описания через DeepSeek V3
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        prompt = body_data.get('prompt', '').strip()
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Prompt is required'}),
                'isBase64Encoded': False
            }
        
        from openai import OpenAI
        
        deepseek_api_key = os.environ.get('DEEPSEEK_API_KEY')
        
        if not deepseek_api_key:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'DeepSeek API key not configured'}),
                'isBase64Encoded': False
            }
        
        system_prompt = """Ты - эксперт по веб-разработке. Создай полноценный HTML-файл сайта на основе описания пользователя.

Требования:
1. Один самодостаточный HTML файл с встроенными <style> и <script>
2. Современный дизайн с Tailwind CSS (через CDN)
3. Адаптивная верстка
4. Плавные анимации и hover-эффекты
5. Чистый, читаемый код с комментариями
6. Используй яркие цвета и градиенты где уместно
7. Добавь интерактивность через JavaScript где нужно

Верни только готовый HTML код без объяснений."""

        client = OpenAI(
            api_key=deepseek_api_key,
            base_url="https://api.deepseek.com"
        )
        
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Создай сайт: {prompt}"}
            ],
            temperature=0.8,
            max_tokens=4000
        )
        
        generated_code = response.choices[0].message.content.strip()
        
        if generated_code.startswith('```html'):
            generated_code = generated_code[7:]
        if generated_code.startswith('```'):
            generated_code = generated_code[3:]
        if generated_code.endswith('```'):
            generated_code = generated_code[:-3]
        
        generated_code = generated_code.strip()
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'code': generated_code,
                'prompt': prompt,
                'model': 'deepseek-chat'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }