import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Form, Segment, Header, Icon, Message, Button } from 'semantic-ui-react';
import '../../../server/firebase';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

import '../Auth.css';

const Register = () => {

    let user = {
        userName: '',
        email: '',
        password: '',
        confirmpassword: '',
    }

    let errors = [];

    const database = getDatabase();

    const [userState, setUserState] = useState(user);
    const [errorState, setErrorState] = useState(errors);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
        else if (!checkPassword()) {
            return false;
        }
        return true;

    }

    const isFormEmpty = () => {
        return !userState.userName.length || !userState.email.length || !userState.password.length || !userState.confirmpassword.length;
    }

    const checkPassword = () => {
        if (userState.password.length < 8) {
            setErrorState((error) => error.concat({ message: 'Password length must be greater then 8.' }));
            return false;
        }
        else if (userState.password !== userState.confirmpassword) {
            setErrorState((error) => error.concat({ message: 'Password and Confirm Password does not match.' }));
            return false;
        }
        return true;
    }

    const onSubmit = (event) => {
        setErrorState((error) => []);
        setIsSuccess(false);
        if (checkForm()) {
            setIsLoading(true);
            const auth = getAuth();
            createUserWithEmailAndPassword(auth, userState.email, userState.password)
                .then(createdUser => {
                    setIsLoading(false);
                    console.log(createdUser);
                    updateUserDetails(createdUser);
                })
                .catch(servererror => {
                    setIsLoading(false);
                    setErrorState((error) => error.concat({ message: "User already exists" }));
                });
        }
    }

    const updateUserDetails = (createdUser) => {
        if (createdUser) {
            setIsLoading(true);
            console.log(userState.userName);
            const auth = getAuth();
            updateProfile(auth.currentUser, {
                displayName: userState.userName,
                photoURL: `http://gravatar.com/avatar/${createdUser.user.uid}?d=identicon`
            }).then(() => {
                console.log(createdUser);
                saveUserInDB(createdUser);
                setIsLoading(false);
            }).catch((servererror) => {
                setIsLoading(false);
                setErrorState((error) => error.concat(servererror));
            });
        }
    }

    const saveUserInDB = async (createdUser) => {
        console.log("Saving data...")
        setIsLoading(true);
        await set(ref(database, 'users/' + createdUser.user.uid), {
            displayName: createdUser.user.displayName,
            photoURL: createdUser.user.photoURL
        }).then(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }).catch((servererror) => {
            setIsLoading(false);
            setErrorState((error) => error.concat(servererror));
        });
    }

    const formatErrors = () => {
        return errorState.map((error, index) => <p key={index}>{error.message}</p>)
    }

    return (
        <Grid verticalAlign='middle' textAlign='center' className='grid-form'>
            <Grid.Column style={{ maxWidth: '500px' }}>
                <Header icon as="h2">
                    <Icon name="university" />
                    Register
                </Header>
                <Form onSubmit={onSubmit}>
                    <Segment stacked>
                        <Form.Input
                            name="userName"
                            value={userState.userName}
                            icon="user"
                            iconPosition='left'
                            onChange={handleInput}
                            type='text'
                            placeholder="User Name"
                        />
                        <Form.Input
                            name="email"
                            value={userState.email}
                            icon="mail"
                            iconPosition='left'
                            onChange={handleInput}
                            type='text'
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
                        <Form.Input
                            name="confirmpassword"
                            value={userState.confirmPassword}
                            icon="lock"
                            iconPosition='left'
                            onChange={handleInput}
                            type='password'
                            placeholder="Confirm Password"
                        />
                    </Segment>
                    <Button disabled={isLoading} >Submit</Button>
                </Form>
                {errorState.length > 0 && <Message error>
                    <h3>Errors</h3>
                    {formatErrors()}
                </Message>
                }
                {isSuccess && <Message success>
                    <h3>Successfully Registered!</h3>
                </Message>
                }
                <Message>
                    Already an User? <Link to="/login">Login</Link>
                </Message>
            </Grid.Column>
        </Grid >
    );
}

export default Register;