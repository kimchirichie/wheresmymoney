/* eslint-disable no-underscore-dangle */

import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import FileSaver from 'file-saver';
import base64ToBlob from 'b64-to-blob';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import _ from 'lodash';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import { withTracker } from 'meteor/react-meteor-data';
import InputHint from '../../components/InputHint/InputHint';
import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';

const StyledProfile = styled.div`
  .LoggedInWith {
    padding: 20px;
    border-radius: 3px;
    color: #fff;
    border: 1px solid var(--gray-lighter);
    text-align: center;

    img {
      width: 100px;
    }

    &.github img {
      width: 125px;
    }

    p {
      margin: 20px 0 0 0;
      color: var(--gray-light);
    }

    .btn {
      margin-top: 20px;

      &.btn-facebook {
        background: var(--facebook);
        border-color: var(--facebook);
        color: #fff;
      }

      &.btn-google {
        background: var(--google);
        border-color: var(--google);
        color: #fff;
      }

      &.btn-github {
        background: var(--github);
        border-color: var(--github);
        color: #fff;
      }
    }
  }

  .btn-export {
    padding: 0;
  }
`;

class Profile extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  getUserType(user) {
    const userToCheck = user;
    delete userToCheck.services.resume;
    const service = Object.keys(userToCheck.services)[0];
    return service === 'password' ? 'password' : 'oauth';
  }

  handleExportData(event) {
    event.preventDefault();
    Meteor.call('users.exportData', (error, exportData) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        FileSaver.saveAs(base64ToBlob(exportData), `${Meteor.userId()}.zip`);
      }
    });
  }

  handleDeleteAccount() {
    if (confirm('Are you sure? This will permanently delete your account and all of its data.')) {
      Meteor.call('users.deleteAccount', (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Account deleted!', 'success');
        }
      });
    }
  }

  handleSubmit() {
    const profile = {
      emailAddress: this.form.emailAddress.value,
      profile: {
        name: {
          first: this.form.firstName.value,
          last: this.form.lastName.value,
        },
      },
    };

    Meteor.call('users.editProfile', profile, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Profile updated!', 'success');
      }
    });

    if (this.form.newPassword.value) {
      Accounts.changePassword(this.form.currentPassword.value, this.form.newPassword.value, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          this.form.currentPassword.value = ''; // eslint-disable-line no-param-reassign
          this.form.newPassword.value = ''; // eslint-disable-line no-param-reassign
        }
      });
    }
  }

  renderOAuthUser(loading, user) {
    return !loading ? (
      <div className="OAuthProfile">
        {Object.keys(user.services).map(service => (
          <div key={service} className={`LoggedInWith ${service}`}>
            <img src={`/${service}.svg`} alt={service} />
            <p>{`You're logged in with ${_.capitalize(service)} using the email address ${user.services[service].email}.`}</p>
            <Button
              className={`btn btn-${service}`}
              href={{
                facebook: 'https://www.facebook.com/settings',
                google: 'https://myaccount.google.com/privacy#personalinfo',
                github: 'https://github.com/settings/profile',
              }[service]}
              target="_blank"
            >
              Edit Profile on {_.capitalize(service)}
            </Button>
          </div>
        ))}
      </div>) : <div />;
  }

  renderPasswordUser(loading, user) {
    return !loading ? (
      <div>
        <Row>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>First Name</ControlLabel>
              <input
                type="text"
                name="firstName"
                defaultValue={user.profile.name.first}
                className="form-control"
              />
            </FormGroup>
          </Col>
          <Col xs={6}>
            <FormGroup>
              <ControlLabel>Last Name</ControlLabel>
              <input
                type="text"
                name="lastName"
                defaultValue={user.profile.name.last}
                className="form-control"
              />
            </FormGroup>
          </Col>
        </Row>
        <FormGroup>
          <ControlLabel>Email Address</ControlLabel>
          <input
            type="email"
            name="emailAddress"
            defaultValue={user.emails[0].address}
            className="form-control"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Current Password</ControlLabel>
          <input
            type="password"
            name="currentPassword"
            className="form-control"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>New Password</ControlLabel>
          <input
            type="password"
            name="newPassword"
            className="form-control"
          />
          <InputHint>Use at least six characters.</InputHint>
        </FormGroup>
        <Button type="submit" bsStyle="success">Save Profile</Button>
      </div>
    ) : <div />;
  }

  renderProfileForm(loading, user) {
    return !loading ? ({
      password: this.renderPasswordUser,
      oauth: this.renderOAuthUser,
    }[this.getUserType(user)])(loading, user) : <div />;
  }

  render() {
    const { loading, user } = this.props;
    return (
      <StyledProfile>
        <Row>
          <Col xs={12} sm={6} md={4}>
            <h4 className="page-header">Edit Profile</h4>
            <form ref={form => (this.form = form)} onSubmit={() => this.handleSubmit()}>
              {this.renderProfileForm(loading, user)}
            </form>
            <AccountPageFooter>
              <p><Button bsStyle="link" className="btn-export" onClick={this.handleExportData}>Export my data</Button> – Download all of your expenses as .txt files in a .zip</p>
            </AccountPageFooter>
            <AccountPageFooter>
              <Button bsStyle="danger" onClick={this.handleDeleteAccount}>Delete My Account</Button>
            </AccountPageFooter>
          </Col>
        </Row>
      </StyledProfile>
    );
  }
}

Profile.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('users.editProfile');

  return {
    loading: !subscription.ready(),
    user: Meteor.user(),
  };
})(Profile);
