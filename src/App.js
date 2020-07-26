/**
 * @Library
 */
import React from "react";
import { connect } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import { createStructuredSelector } from "reselect";
import {
  auth,
  createUserProfileDocument,
  addCollectionAndDocuments,
} from "./firebase/firebase";

/**
 * @Selector
 */
import { selectCurrentUser } from "./redux/users/userSelector";

/**
 * @Action
 */
import { setCurrentUser } from "./redux/users/userAction";

/**
 * @Components
 */
import Header from "./components/header/header";
import HomePage from "./pages/homepage/homepage";
import ShopPage from "./pages/shop/shop";
import CartCheckoutPage from "./pages/cart-checkout/cart-checkout";
import AdminAddProductPage from "./pages/admin-add-products/admin-add-products";
import SignInAndSignUp from "./pages/signin-signup/signin-signup";
import CovidGlimpse from "./pages/covid-glimpse/covid-glimpse";

/**
 * @Style
 */
import "./App.css";

/**
 * @class
 * Main entry point of app front-end logic
 */
class App extends React.Component {
  /**
   * When app component mounts, needs to fetch user information if necessary
   */

  componentDidMount() {
    const { setCurrentUser } = this.props;

    // Once the user's authentification status is changed
    auth.onAuthStateChanged(async (user) => {
      if (user !== null) {
        const userRef = await createUserProfileDocument(user);

        userRef.onSnapshot((snapShot) => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data(),
          });

          /** Programatically populating collection data into firebase,
           *  Only need to do once, so commented it out
           * TODO: rather than adding produce items there, we want to add it to database via a form
           */
          if (false) {
            const collectionItems = [];
            addCollectionAndDocuments(
              "products",
              collectionItems.map(({ title, items }) => ({ title, items }))
            ).catch((err) => console.log(err));
          }
        });
      } else {
        // No user is set, set current user to null
        setCurrentUser(null);
      }
    });
  }

  /**
   * Using React Router to dynamically render different routes
   */
  render() {
    const { user } = this.props;
    return (
      <div>
        <Header />
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route path='/shop' component={ShopPage} />
          <Route exact path='/checkout' component={CartCheckoutPage} />
          <Route
            exact
            path='/signin'
            render={() => (user ? <Redirect to='/' /> : <SignInAndSignUp />)}
          />
          <Route exact path='/admin/add' component={AdminAddProductPage} />
          <Route exact path='/covid-glimpse' component={CovidGlimpse} />
        </Switch>
      </div>
    );
  }
}

/**
 * Storing user's information in the reducer
 */
const mapDispatchToProps = (dispatch) => ({
  setCurrentUser: (user) => dispatch(setCurrentUser(user)),
});

/**
 * Fetching user's information and the products(deleted)
 */
const mapStateToProps = createStructuredSelector({
  user: selectCurrentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
