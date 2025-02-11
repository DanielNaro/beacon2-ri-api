import './SignInForm.css'
import { NavLink } from 'react-router-dom'
import React, { Component, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../NavBar/Navbar'

export default function SignInFormNoLS () {
  const [userName, setUserName] = useState('dummy_user')
  const [password, setPassword] = useState('dummy_pw')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const {
    storeToken,
    setIsLoggedIn,
    refreshTokenFunction,
    authenticateUser,
    setUserNameToShare,
    setExpirationTime,
    setStartTime,
    setExpirationTimeRefresh
  } = useContext(AuthContext)

  const handleChange1 = e => {
    setUserName(e.target.value)
  }

  const handleChange2 = e => {
    setPassword(e.target.value)
  }

  const handleSubmit = async e => {
    try {
      e.preventDefault()
      var details = {
        grant_type: 'password',
        client_id: 'beacon',
        client_secret: 'b26ca0f9-1137-4bee-b453-ee51eefbe7ba',
        username: userName,
        password: password,
        realm: 'Beacon',
        scope: 'openid',
        requested_token_type: 'urn:ietf:params:oauth:token-type:refresh_token'
      }

      var formBody = []
      for (var property in details) {
        var encodedKey = encodeURIComponent(property)
        var encodedValue = encodeURIComponent(details[property])
        formBody.push(encodedKey + '=' + encodedValue)
      }
      formBody = formBody.join('&')

      const response = await fetch(
        'http://localhost:8080/auth/realms/Beacon/protocol/openid-connect/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formBody
        }
      )
      const readableResponse = await response.json()
      storeToken(readableResponse.access_token)
      refreshTokenFunction(readableResponse.refresh_token)

      setExpirationTime(readableResponse.expires_in)
      setExpirationTimeRefresh(readableResponse.refresh_expires_in)

      setStartTime(Date.now())
      //storeToken(response.data.authToken);
      authenticateUser()

      if (readableResponse.access_token) {
        navigate('/')
        setIsLoggedIn(true)
        setUserNameToShare(userName)
      } else {
        setError(
          'User not found. Please check the username and the password and retry'
        )
      }
    } catch (error) {
      setError('User not found')
    }
  }

  return (
    <div className='container'>
      <div className='screen'>
        <div className='screen__content'>
          <form className='login' onSubmit={handleSubmit}>
            <div className='login__field'>
              <img
                className='login__icon'
                src='./user.png'
                alt='userLogo'
              ></img>
              <input
                type='text'
                id='userName'
                className='login__input'
                placeholder='Enter your username'
                name='userName'
                value='dummy_user'
                onChange={e => {
                  handleChange1(e)
                }}
              />
            </div>
            <div className='login__field'>
              <img
                className='login__icon'
                src='./padlock.png'
                alt='padlockLogo'
              ></img>
              <input
                className='login__input'
                id='password'
                placeholder='Enter your password'
                name='password'
                value='dummy_pw'
                onChange={e => {
                  handleChange2(e)
                }}
              />
            </div>
            <button className='button login__submit'>
              <span className='button__text'>Log In Now</span>
              <img
                className='buttonRightArrow'
                src='./right-arrow.png'
                alt='rightArrowLogo'
              ></img>
            </button>
          </form>
        </div>
        <div className='screen__background'>
          <span className='screen__background__shape screen__background__shape4'></span>
          <span className='screen__background__shape screen__background__shape3'></span>
          <span className='screen__background__shape screen__background__shape2'></span>
          <span className='screen__background__shape screen__background__shape1'></span>
        </div>
      </div>
    </div>
  )
}
