import { addUserLocation } from "../api/firebase";

export const getCoordinates = (setFieldValue, setIsGettingCoordinates, setGpsError) => {
    const options = {
        timeout: 10000,
        enableHighAccuracy: true,
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            let lat = position.coords.latitude;
            let long = position.coords.longitude;
            setFieldValue("location.lat", lat);
            setFieldValue("location.long", long);
            setIsGettingCoordinates(false);
        },
        () => {
            setIsGettingCoordinates(false);
            setGpsError(true);
        },
        options
    );
}

export const getCoordinatesOutsideForm = (setIsGettingCoordinates, setGpsError, setViewport) => {
    const options = {
        timeout: 10000,
        enableHighAccuracy: true,
    }
    return navigator.geolocation.getCurrentPosition(
        (position) => {
            let lat = position.coords.latitude;
            let long = position.coords.longitude;
            setIsGettingCoordinates(false);
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
                latitude: lat,
                longitude: long,
                zoom: 14,
            })
        },
        () => {
            setGpsError(true);
            setIsGettingCoordinates(false);
        },
        options
    );
}

export const getGPSCoordinates = (dispatch, verify) => {
    const options = {
        timeout: 10000,
        enableHighAccuracy: true,
    }
    return navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude } = position.coords;
            const { longitude } = position.coords;
            // if(user){
            //     addUserLocation({ user, dispatch })
            // }
            dispatch({ type: 'SET_GPS_COORDINATES', payload: { latitude, longitude } });
            dispatch({ type: 'SET_USER_GPS_COORDINATES', payload: { latitude, longitude } })
            verify();
        },
        () => {
            dispatch({ type: 'HAS_COORDINATES_ERROR' })
        },
        options
    );
}

export const getLiveGPSCoordinates = (dispatch, toast) => {
    const options = {
        timeout: 10000, enableHighAccuracy: true, maximumAge: 0
    }
    return navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            dispatch({ type: 'SET_USER_GPS_COORDINATES', payload: { latitude, longitude } });
        },
        (e) => {
            dispatch({ type: 'HAS_COORDINATES_ERROR' });
            toast({
                title: "Location error.",
                description: "Your location could not be determined.",
                status: "error",
                duration: 9000,
                isClosable: true,
                position: "bottom-left",
            })
            console.log(e)
        },
        options
    );
}