let serverURLs = {
    "dev": {
        "NODE_SERVER": "http://localhost",
        "NODE_SERVER_PORT": "7989",
        "MYSQL_HOST": 'localhost',
        "MYSQL_USER": 'root',
        "MYSQL_PASSWORD": 'Techugo@123',
        'MYSQL_DATABASE': 'kart_dev_db',
        "EMAIL_USER": 'test.techugo@gmail.com',
        "EMAIL_PASS": 'LUCKY@005',
        "EMAIL_HOST": 'smtp.gmail.com',
        "EMAIL_PORT": 465,
        "EMAIL_SECURE": true,
    },
    "live": {
        "NODE_SERVER": "http://65.1.202.212/",
        "NODE_SERVER_PORT": "7989",
        "MYSQL_HOST": 'localhost',
        "MYSQL_USER": 'kart_dev',
        "MYSQL_PASSWORD": 'n4pra8hlcistath?vAsw',
        'MYSQL_DATABASE': 'kart_dev_db',
        "EMAIL_USER": 'test.techugo@gmail.com',
        "EMAIL_PASS": 'LUCKY@005',
        "EMAIL_HOST": 'smtp.gmail.com',
        "EMAIL_PORT": 465,
        "EMAIL_SECURE": true,
    }
}

module.exports = {
    serverURLs: serverURLs
}