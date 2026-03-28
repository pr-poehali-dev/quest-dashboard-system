"""Тонкий прокси к PostgreSQL. Принимает SQL-запросы от фронтенда и возвращает результат."""
import os, json, psycopg2, psycopg2.extras

def get_conn():
    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 't_p73964683_quest_dashboard_syst')
    conn = psycopg2.connect(dsn, options=f'-c search_path={schema}')
    return conn

def handler(event: dict, context) -> dict:
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')
        params = body.get('params', [])
        sql = body.get('sql', '')

        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if action == 'query':
            cur.execute(sql, params if params else None)
            rows = [dict(r) for r in cur.fetchall()]
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'data': rows}, default=str)}

        elif action == 'execute':
            cur.execute(sql, params if params else None)
            conn.commit()
            rowcount = cur.rowcount
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'affected': rowcount})}

        elif action == 'execute_returning':
            cur.execute(sql, params if params else None)
            row = cur.fetchone()
            conn.commit()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'data': dict(row) if row else None}, default=str)}

        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Unknown action'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': str(e)})}
