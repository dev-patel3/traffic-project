from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/test')
def test():
    return {'message': 'Connected to Flask!'}

if __name__ == '__main__':
    app.run(debug=True)