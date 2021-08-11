import React from 'react';
import Flex from '../../common/Flex';
import './header.scss';
import SettingsMenu from '../SettingsMenu';
import { Box, Button, Slide } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { useGlobalState } from '../../providers/root';
import LockAndKeyLogo from '../../common/Logo';
import Font from '../../common/Font';

const Header = () => {
    const { meta, coordinates, firebase } = useGlobalState();
    const history = useHistory();
    const fixed = {
        position: 'fixed',
        top: 0,
        width: "100%",
        zIndex: 6,
        borderBottom: '1px solid #ffffff6b',
    }

    return (
        <Slide direction="top" in style={{ zIndex: 10 }}>
            <Flex style={{ ...fixed }}
                transitionBackground
                display="flex"
                alignItems="center"
                padding={meta.isInstalled ? "50px 20px 15px 20px" : "15px 20px"}
                className="header"
            >
                <Flex display="flex" direction="column" justifyContent="center">
                    <Flex display="flex" direction="row" margin="0px 0px 0px 0px" hoverCursor alignItems="center">
                        {/* <BsFillShieldLockFill /> */}
                        <LockAndKeyLogo />
                        <Box marginRight={2} />
                        <Font variant="primary" onClick={() => history.push("/")} fontWeight="bold">Lock & Key</Font>
                        <Box marginRight={2} flexGrow={1} />
                    </Flex>
                </Flex>
                <Flex />
                <Flex flexGrow="none" margin="0px 10px 0px 0px" />
                {!meta.isInstalled && <SettingsMenu />}
            </Flex>
        </Slide>
    )
};

export default Header;
