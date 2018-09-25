import React from 'react';
import autoBind from 'react-autobind';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { connect } from 'react-redux';
import { Field, reduxForm, reset } from 'redux-form';
import OAuthLoginButtons from '../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';

class Login extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    Meteor.loginWithPassword(this.props.emailAddress, this.props.password, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Welcome back!', 'success');
        reset('login');
      }
    });
  }

  render() {
    return (
      <div className="Login">
        <Row>
          <Col xs={12} sm={6} md={5} lg={4}>
            <h4 className="page-header">Log In</h4>
            <Row>
              <Col xs={12}>
                <OAuthLoginButtons
                  services={['facebook', 'github', 'google']}
                  emailMessage={{
                    offset: 100,
                    text: 'Log In with an Email Address',
                  }}
                />
              </Col>
            </Row>
            <form onSubmit={e => this.handleSubmit(e)}>
              <FormGroup>
                <ControlLabel>Email Address</ControlLabel>
                <Field className="form-control" name="emailAddress" type="email" component="input" />
              </FormGroup>
              <FormGroup>
                <ControlLabel className="clearfix">
                  <span className="pull-left">Password</span>
                  <Link className="pull-right" to="/recover-password">Forgot password?</Link>
                </ControlLabel>
                <Field className="form-control" name="password" type="password" component="input" />
              </FormGroup>
              <Button type="submit" bsStyle="success">Log In</Button>
              <AccountPageFooter>
                <p>{'Don\'t have an account?'} <Link to="/signup">Sign Up</Link>.</p>
              </AccountPageFooter>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

Login.defaultProps = {
  emailAddress: '',
  password: '',
};

Login.propTypes = {
  emailAddress: PropTypes.string,
  password: PropTypes.string,
};

const mapStateToProps = state => ({
  emailAddress: (state.form.login && state.form.login.values && state.form.login.values.emailAddress)
    ? state.form.login.values.emailAddress
    : '',
  password: (state.form.login && state.form.login.values && state.form.login.values.password)
    ? state.form.login.values.password
    : '',
});

const LoginContainer = connect(mapStateToProps)(Login);
export default reduxForm({ form: 'login' })(LoginContainer);
