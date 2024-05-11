import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  getAuth,
} from 'firebase/auth';
import {
  addDoc, arrayUnion, arrayRemove, collection,
  deleteDoc, doc, getDoc, updateDoc, 
} from 'firebase/firestore';
import {
  auth, db,
} from './firebase';

// eslint-disable-next-line max-len
export const signInUsers = async (email, password) => signInWithEmailAndPassword(auth, email, password);

// eslint-disable-next-line camelcase
export async function call_login_google() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log({ user });
    return user;
  } catch (error) {
    const errorMessage = error.message;
    console.log({ errorMessage });
    return errorMessage;
  }
}

// Función para el botón de registrar nuevos usuarios
// eslint-disable-next-line max-len
export const createUser = (email, password, displayName) => createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log('Nombre de usuario en createUser:', displayName);
    return updateProfile(user, { displayName })
      .then(() => user);
  })
  .catch((error) => {
    throw error;
  });

// Manejar cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    const userId = user.uid;
    console.log('ID del usuario actual:', userId);

    // Ahora puedes usar userId en tu aplicación
  } else {
    console.log('No hay usuario autenticado');
  }
});

// Función para dar like a los post
export async function likePost(postId, operationType) {
  const auth = getAuth();
  console.log (auth)
  const userUid = auth.currentUser.uid;
  console.log (postId, operationType, userUid)
  try {
    const postRef = doc(db, 'postDrinks', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      let likedBy = postDoc.data().likedBy || [];

      if (operationType === 'arrayUnion') {
        likedBy = arrayUnion(userUid);
      } else if (operationType === 'arrayRemove') {
        likedBy = arrayRemove(userUid);
      }

      await updateDoc(postRef, { likedBy });
      console.log('Operación de like realizada correctamente');
    } else {
      console.log('El post no existe');
    }
  } catch (error) {
    console.error('Error al dar like al post', error);
  }
}

// Función para eliminar un post
export const deletePost = async (documentId) => {
  try {
    const user = auth.currentUser;

    // Obtener el post que se quiere eliminar
    const postRef = doc(db, 'postDrinks', documentId);
    const postSnapshot = await getDoc(postRef);

    // Verificar si el post existe y si el usuario actual es el autor
    if (postSnapshot.exists()) {
      const postData = postSnapshot.data();
      if (postData.authorId === user.uid) { // Verificar si el autor del post es el usuario actual
        await deleteDoc(postRef);
        console.log('Post eliminado exitosamente.');
      } else {
        console.log('No tienes permisos para eliminar este post.');
      }
    } else {
      console.log('El post que intentas eliminar no existe.');
    }
  } catch (error) {
    console.error('Error al intentar eliminar el post:', error);
  }
};
export const editPost = async (postId, updatedData) => {
  try {
    const user = auth.currentUser;

    // Obtener el post que se quiere editar
    const postRef = doc(db, 'postDrinks', postId);
    const postSnapshot = await getDoc(postRef);

    // Verificar si el post existe y si el usuario actual es el autor
    if (postSnapshot.exists()) {
      const postData = postSnapshot.data();
      if (postData.authorId === user.uid) { // Verificar si el autor del post es el usuario actual
        await updateDoc(postRef, updatedData);
        console.log('Post editado exitosamente.');
      } else {
        console.log('No tienes permisos para editar este post.');
      }
    } else {
      console.log('El post que intentas editar no existe.');
    }
  } catch (error) {
    console.error('Error al intentar editar el post:', error);
  }
}
// Función para cerrar sesión
export const signOutFunction = () => {
  signOut(auth);
};

export const storeUserInfo = (info) => addDoc(collection(db, 'usersDrinks'), info); // revisar