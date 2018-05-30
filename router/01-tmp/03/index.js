import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, Redirect, withRouter } from "react-router-dom";

const fakeAuth = {
    isAuthenticated: false,
    authenticate(cb) {
        this.isAuthenticated = true;
        setTimeout(cb, 100);
    },
    signout(cb) {
        this.isAuthenticated = false;
        setTimeout(cb, 100);
    }
};

const AuthButton = withRouter(
    ({ history }) => fakeAuth.isAuthenticated ?
        (
            <p>Welcome!{" "}<button onClick={() => { fakeAuth.signout(() => history.push("/")); }}>Sign out</button></p>
        ) :
        (
            <p>You are not logged in.</p>
        )
);

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => fakeAuth.isAuthenticated ?
        (
            <Component {...props} />
        ) :
        (
            <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
    }
    />
);

const Public = () => <h3>Public</h3>;
const Protected = () => <h3>Protected</h3>;

class Login extends React.Component {
    state = { redirectToReferrer: false };

    login = () => {
        fakeAuth.authenticate(() => {
            this.setState({ redirectToReferrer: true });
        });
    };

    render() {
        const { from } = this.props.location.state || { from: { pathname: "/" } };
        const { redirectToReferrer } = this.state;

        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }

        return (
            <div>
                <p>You must log in to view the page at {from.pathname}</p>
                <button onClick={this.login}>Log in</button>
            </div>
        );
    }
}

const Layout = () => (
    <BrowserRouter>
        <div>
            <AuthButton />
            <ul>
                <li><Link to="/public">Public Page</Link></li>
                <li><Link to="/protected">Protected Page</Link></li>
            </ul>
            <Route path="/public" component={Public} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/protected" component={Protected} />
        </div>
    </BrowserRouter>
);

ReactDOM.render(<Layout />, document.getElementById('root'));