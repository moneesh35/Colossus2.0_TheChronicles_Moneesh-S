// src/components/Auth/AuthPage.js
import React, { useState } from 'react';
import { auth, googleProvider, db } from '../../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import '../../styles/AuthPage.css';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [domains, setDomains] = useState('');
  const [subjects, setSubjects] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        domains,
        subjects,
      });
      navigate('/home');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          email,
          domains,
          subjects,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/home');

    } catch (err) {
      alert(err.message);
    }
  };
  

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleAuth}>
        <h2>{isRegistering ? 'Register' : 'Login'} to StudyBuddy</h2>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Domains of Interest (comma separated)"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
            />
            <input
              type="text"
              placeholder="Subjects of Interest (comma separated)"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
            />
          </>
        )}

        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        

        <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>

        <p onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering
            ? 'Already have an account? Login'
            : "Don't have an account? Register"}
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
