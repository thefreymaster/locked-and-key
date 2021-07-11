import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

import { authValidationComplete, fetchingComplete, isFetching } from "../actions";

const initialize = ({ lat, lng, dispatch, showSuccessToast }) => {
    firebase.auth()
        .getRedirectResult()
        .then((result) => {
            if (result.credential) {
                dispatch({ type: 'FIREBASE_AUTHENTICATION_SUCCESS', payload: { user: result.user } });
                setTimeout(() => {
                    dispatch({ type: 'TOGGLE_SETTINGS_DRAWER' });
                }, 500);
                showSuccessToast();
            }
            if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
                console.log('new')
            }
        }).catch((error) => {
            console.error(error);
        });
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            dispatch({ type: 'FIREBASE_AUTHENTICATION_SUCCESS', payload: { user } });
        }
        const dbKey = `${lng.toFixed(0) + lat.toFixed(0)}`;
        dispatch({ type: 'SET_DB_KEY', payload: { dbKey } })
        var refUpdates = firebase.database().ref(`locks/${dbKey}`);
        refUpdates.on('value', (snapshot) => {
            dispatch(isFetching);
            const snapshotValue = snapshot.val();
            if (snapshotValue) {
                dispatch({
                    type: 'POPULATE_DATA',
                    payload: {
                        locks: snapshotValue
                    }
                });
                dispatch(fetchingComplete);
            }
            else {
                dispatch(fetchingComplete);
            }
        })
        dispatch(fetchingComplete);
        dispatch(authValidationComplete);
    })
}

const signIn = (dispatch, showSuccessToast) => {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

const signOut = (dispatch, showInfoToast, history) => {
    firebase.auth().signOut().then(function () {
        setTimeout(() => {
            dispatch({ type: 'FIREBASE_AUTHENTICATION_SIGN_OUT_SUCCESS' });
            showInfoToast();
            history.push("/")
            setTimeout(() => {
                dispatch({ type: 'TOGGLE_SETTINGS_DRAWER' });
            }, 1000);
        }, 500);
    }).catch(function (error) {
        console.error(error);
    });
}

export const addUserLocation = ({ postData, user, dispatch }) => {
    const [provider] = user.providerData;
    var userListRef = firebase.database().ref(`users/${user.uid}`);
    userListRef.update({
        ...postData,
        createdDate: new Date().toISOString(),
        provider
    }).then(() => {
        dispatch(fetchingComplete);
    });
}

const add = ({ postData, uid, dispatch, toast, lat, lng, onClose, history }) => {
    dispatch(isFetching);
    var listRef = firebase.database().ref(`locks/${lng.toFixed(0) + lat.toFixed(0)}`);
    listRef.push({ ...postData, createdDate: new Date().toISOString(), author: uid }).then(() => {
        toast();
        dispatch(fetchingComplete);
        onClose();
        history.push('/map');
    });
}

const update = ({ postData, dispatch, itemId, toast, onClose, history, dbKey }) => {
    dispatch(isFetching);
    var restaurantListRef = firebase.database().ref(`locks/${dbKey}/${itemId}`);
    console.log({ ...postData, modifiedData: new Date().toISOString() })
    restaurantListRef.update({ ...postData, modifiedData: new Date().toISOString() }).then(() => {
        toast();
        dispatch(fetchingComplete);
        onClose();
        history.push('/map');
    });
}

const remove = ({ dispatch, history, itemId, onClose, setIsDeleting, toast, dbKey }) => {
    dispatch(isFetching);
    var restaurantListRef = firebase.database().ref(`locks/${dbKey}/${itemId}`);
    restaurantListRef.remove().then(() => {
        toast();
        dispatch(fetchingComplete);
        setIsDeleting(false);
        onClose();
        history.push("/");
    });
}

const upload = ({ uid, file, form, setIsUploading }) => {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const imageRef = storageRef.child(`images/${uid}/${uuidv4()}`);
    const options = {
        maxSizeMB: 0.5,
        useWebWorker: true
    }
    imageCompression(file, options)
        .then(function (compressedFile) {
            imageRef.put(compressedFile).then((snapshot) => {
                const { metadata } = snapshot;
                const { fullPath } = metadata;
                form.setFieldValue("imageUrl", fullPath);
                console.log('Uploaded a blob or file!');
                setIsUploading(false);
            });
        })
        .catch(function (error) {
            console.log(error.message);
        });
}

const getImage = ({ id, fileUrl, dispatch }) => {
    const storage = firebase.storage();
    const storageRef = storage.ref();
    return storageRef.child(fileUrl).getDownloadURL()
        .then((url) => dispatch({ type: 'SET_IMAGE_ABSOLUTE_URL', payload: { url, id } }))
}

const refresh = ({ lat, lng, dispatch }) => {
    const dbKey = `${lng.toFixed(0) + lat.toFixed(0)}`;
    var refUpdates = firebase.database().ref(`locks/${dbKey}`);
    refUpdates.on('value', (snapshot) => {
        dispatch(isFetching);
        const snapshotValue = snapshot.val();
        if (snapshotValue) {
            dispatch({
                type: 'POPULATE_DATA',
                payload: {
                    locks: snapshotValue
                }
            });
            dispatch(fetchingComplete);
        }
        else {
            dispatch(fetchingComplete);
        }
    })

}

const firebaseApi = {
    initialize,
    auth: {
        signIn,
        signOut,
    },
    add,
    update,
    remove,
    upload,
    refresh,
    getImage,
}

export default firebaseApi;
