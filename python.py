from flask_app import create_app

app = create_app()  
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB

if __name__ == "__main__":
    app.run(debug=True, port=5000)
