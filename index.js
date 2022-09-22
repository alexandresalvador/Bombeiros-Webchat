const express = require('express');

//const dotenv = require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

const app = express();

app.set('views', './app/views');
app.use(express.static('./app/public'));

const JWTSecret = '605d9882-0de6-4925-94bc-d447f7314fe1';

// codigo para converter em json
app.use(express.urlencoded({ extendend: false }));
app.use(express.json());
  
const DB = {
    usuarios: [
        {
            id: 1,
            email: 'admin',
            password: 'admin123'
        },
        {
            id: 2,
            email: 'bombeiro',
            password: 'bomb789'
        },
        {
            id: 3,
            email: 'joe doe',
            password: 'joe456'
        },
    ]
}

function auth(req, res, next) {
    const authToken = req.headers['authorization'];
    console.log(authToken)

    if(authToken !== undefined) {
        // dividindo o token em 2 
        const bearer = authToken.split( ' ')
        console.log('BEARER', bearer);

        const token = bearer[1];

        jwt.verify(token, JWTSecret, (err, data) => {
            if(err) {
                res.status(401);
                res.json({message: 'ERRO6 - Token inválido'})
            }else {
                console.log(data);
                res.token = token;
            }
        });
    } else {
        res.status(401);
        res.json({message: 'ERRO7: Esta rota está protegida, não é possível acessar ela no momento'})
    }
    next();
}

app.get('/usuarios', (req, res) => {

    // endpoint usuarios
    res.json(DB.usuarios);
});

app.set('view engine', 'ejs');
app.get('/', (req, res) => {

    res.render('telaLogin');
});

app.get('/chat', auth, (req, res) => {

    res.render('chatBombeiro');
});


app.post('/auth', (req, res) => {
    const { email, password } = req.body;
    console.log("usuario", req.body)
    if (email !== undefined) {
        const user = DB.usuarios.find(u => u.email === email);
        if (user !== undefined) {
            if (user.password === password) {
                // gerando o nosso token assim que o usuario fez login com sucesso
                // as informaçoes do payload do token serão id e email
                // assinatura do token
                jwt.sign({
                    id: user.id,
                    email: user.email,
                }, JWTSecret, { // checando  a chave secreta da minha aplicação
                    expiresIn: '1h' // tempo de expiração do token
                }, (err, token) => {
                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.json({ message: 'ERR5: Ops, não foi possível gerar o token' });
                    } else {
                        res.status(200);
                        // res.json({message: 'Usuario logado com sucesso, token enviado.'})
                        res.json({ token });
                    }
                })
            } else {
                res.status(401)
                res.json({ message: 'ERR2: Email ou password não coincidem.' });
            }
        } else {
            res.status(404),
                res.json({ message: 'ERR3: Ops, usuario não existe.' })
        }
    } else {
        res.status(400);
        res.json({ message: 'ERR1: Email ou password não podem ser nulos.' })
    }
})








app.listen(5000, () => {
  console.log('Está funcionando aqui => http://localhost:5000');
});