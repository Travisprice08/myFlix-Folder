import React from 'react';
import axios from 'axios';
import { connect } from 'react-redux';

import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

import { setMovies } from '../../actions/actions';
import { setUser } from '../../actions/actions';

import MoviesList from '../movies-list/movies-list';

//MovieCard will be imported and used in MoviesList
//import { MovieCard } from '../movie-card/movie-card';
import { MovieView } from '../movie-view/movie-view';
import { LoginView } from '../login-view/login-view';
import { RegistrationView } from '../registration-view/registration-view';
import { DirectorView } from '../director-view/director-view';
import { GenreView } from '../genre-view/genre-view';
import { ProfileView } from '../profile-view/profile-view';

import { Navbar, Row, Col, Container, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";

import './main-view.scss';

//Removed keyword "extends from the beginning"
class MainView extends React.Component {

    constructor() {
        super();
        this.state = {
            //commented out movies state for 3.8
            //movies: [],
            directors: [],
            genres: [],
            // user: ""
        };
    }

    componentDidMount() {
        let accessToken = localStorage.getItem('token');
        if (accessToken !== null) {
            this.props.setUser(localStorage.getItem("user"))
            this.getMovies(accessToken);
            this.getUsers(accessToken);
            this.getDirectors(accessToken)
            this.getGenres(accessToken)
        }
    }

    // src/components/main-view/main-view.jsx
    getMovies(token) {
        axios.get('https://myfilmdb.herokuapp.com/movies', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                /*this.setState({
                    movies: response.data
                });*/
                this.props.setMovies(response.data)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getGenres(token) {
        axios.get('https://myfilmdb.herokuapp.com/genres', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                // Assign the result to the state
                this.setState({
                    genres: response.data
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getDirectors(token) {
        axios.get('https://myfilmdb.herokuapp.com/directors', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                // Assign the result to the state
                this.setState({
                    directors: response.data
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getUsers(token) {
        axios.get('https://myfilmdb.herokuapp.com/users', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                this.setState({
                    users: response.data
                });
                console.log(response)
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //componentWillUnmount {}
    //code executed just before the moment the componeent gets removed from the DOM

    /* When a user successfully logs in, this function updates the `user` property in state
       to that *particular user*/

    onLoggedIn(authData) {
        console.log('authData: ', authData);
        // this.setState({
        //     user: authData.user.Username
        // });

        this.props.setUser(authData.user.Username);

        localStorage.setItem('token', authData.token);
        localStorage.setItem('user', authData.user.Username);
        this.getMovies(authData.token);
        // this.getUsers(authData.token);
    }

    //Add log out button
    onLoggedOut() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.setState({
            user: null
        });
    }

    onRegister(register) {
        this.setState({
            register
        });
    }


    render() {

        const { movies, user } = this.props;
        //movies now extracted from this.props instead of this.state
        const { directors, genres, history } = this.state;
        console.log(movies)
        console.log(directors)
        console.log(genres)
        console.log(user)
        return (
            <Router>
                <Row className="main-view justify-content-md-center">
                    <Container>
                        <Navbar>
                            <Navbar.Brand>MyFlix</Navbar.Brand>
                            <ul>
                                <Link to={`/`}>
                                    <Button variant="link">Movies</Button>
                                </Link>
                                <Link to={`/users/${user}`}>
                                    <Button variant="link">Profile</Button>
                                </Link>
                                <Link to={`/`}>
                                    <Button variant="link" onClick={() => this.onLoggedOut()}
                                    >Logout</Button>
                                </Link>
                            </ul>
                        </Navbar>
                    </Container>

                    <Route exact path="/" render={() => {
                        if (!user) return <Col>
                            <LoginView onLoggedIn={(user) => this.onLoggedIn(user)} />
                        </Col>
                        if (movies) {
                            if (movies.length === 0) return <div className="main-view" />;
                            /*return movies.map(m => (
                                <Col md={3} key={m._id}>
                                    <MovieCard movie={m} director={directors.find(d => d._id === m.Director[0])} />
                                </Col>
                            ))*/
                            return <MoviesList key={movies._id} movies={movies} />
                        }
                    }} />

                    <Route path="/register" render={() => {
                        if (user) return <Redirect to="/" />
                        return <Col>
                            <RegistrationView />
                        </Col>
                    }} />

                    <Route path="/users/:username" render={() => {
                        if (!user || !movies) return
                        //if (user.token === '') return <Redirect to="/" />
                        return (
                            <Col>
                                <ProfileView onLoggedIn={user => this.onLoggedIn(user)}
                                    movies={movies} user={user}
                                    //token={localStorage.getItem('token')}
                                    onBackClick={() => history.goBack()} />
                            </Col>
                        )
                    }} />

                    {/*Error for cannot read propert 'length' of undefined here, added if statement*/}
                    <Route path="/movies/:movieId" render={({ match, history }) => {
                        if (!user) return
                        if (movies) {
                            if (movies.length === 0) return <div className="main-view" />
                            return <Col md={8}>
                                <MovieView
                                    movie={movies.find(m => m._id === match.params.movieId)}
                                    directors={directors}
                                    genres={genres}
                                    onBackClick={() => history.goBack()} />
                            </Col>
                        }
                    }} />

                    <Route exact path="/genres/:name" render={({ match, history }) => {
                        //if (!user) return
                        if (movies.length === 0) return <div className="main-view" />;
                        return <Col md={8}>
                            <GenreView genre={genres.find(d => d.Name === match.params.name)} onBackClick={() => history.goBack()} />
                        </Col>
                    }} />

                    <Route path="/directors/:name" render={({ match, history }) => {
                        if (movies) {
                            if (movies.length === 0) return <div className="main-view" />;
                            return <Col md={8}>
                                <DirectorView director={directors.find(d => d.Name === match.params.name)} onBackClick={() => history.goBack()} />
                            </Col>
                        }
                    }
                    } />
                </Row>
            </Router>
        );
    }

}

let mapStateToProps = state => {
    return {
        movies: state.movies,
        user: state.user
    }
}

export default connect(mapStateToProps, { setMovies, setUser })(MainView);