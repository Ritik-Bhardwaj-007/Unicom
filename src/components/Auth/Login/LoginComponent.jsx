import React, { useState } from 'react';
import { Grid, Form, Segment, Header, Icon, Message, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import '../../../server/firebase';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import '../Auth.css';

const Login = () => {

    let user = {
        email: '',
        password: '',
    }

    let errors = [];

    const [userState, setUserState] = useState(user);
    const [errorState, setErrorState] = useState(errors);
    const [isLoading, setIsLoading] = useState(false);

    const handleInput = (event) => {
        let target = event.target;
        setUserState((currentState) => {
            let currentUser = { ...currentState };
            currentUser[target.name] = target.value;
            return currentUser;
        });
    }

    const checkForm = () => {
        if (isFormEmpty()) {
            setErrorState((error) => error.concat({ message: 'Please fill all the fields' }));
            return false;
        }
        return true;

    }

    const isFormEmpty = () => {
        return !userState.email.length || !userState.password.length;
    }

    const onSubmit = (event) => {
        setErrorState((error) => []);
        if (checkForm()) {
            setIsLoading(true);
            const auth = getAuth();
            signInWithEmailAndPassword(auth, userState.email, userState.password)
                .then(user => {
                    setIsLoading(false);
                })
                .catch(servererror => {
                    setIsLoading(false);
                    setErrorState((error) => error.concat({ message: "User credentials does not exist" }));
                });
        }
    }

    const formatErrors = () => {
        return errorState.map((error, index) => <p key={index}>{error.message}</p>)
    }

    return (
        <Grid verticalAlign='middle' textAlign='center' className='grid-form'>
            <Grid.Column style={{ maxWidth: '500px' }}>
                <Header icon as="h2">
                    <Icon name="university" />
                    Login
                </Header>
                <Form onSubmit={onSubmit}>
                    <Segment stacked>
                        <Form.Input
                            name="email"
                            value={userState.email}
                            icon="mail"
                            iconPosition='left'
                            onChange={handleInput}
                            type='email'
                            placeholder="Email"
                        />
                        <Form.Input
                            name="password"
                            value={userState.password}
                            icon="lock"
                            iconPosition='left'
                            onChange={handleInput}
                            type='password'
                            placeholder="Password"
                        />
                    </Segment>
                    <Button disabled={isLoading} >Login</Button>
                </Form>
                {errorState.length > 0 && <Message error>
                    <h3>Errors</h3>
                    {formatErrors()}
                </Message>
                }
                <Message>
                    New User? <Link to={"/register"}>Register</Link>
                </Message>
            </Grid.Column>
        </Grid>
    );
}

export default Login;