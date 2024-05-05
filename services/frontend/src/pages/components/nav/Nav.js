import {
    Flex,
    Menu,
    useColorModeValue,
  } from '@chakra-ui/react';
import NavButton from "./NavButton";
import IconNav from '../icons/IconNav';

function Nav() {

    const linkHoverColor = useColorModeValue('gray.800', 'whiteAlpha.900');
    
    return (
        <Flex as="nav" className="user-nav" align="center" justify="space-between" wrap="wrap" padding="1.5rem" bg={useColorModeValue('gray.50', 'gray.900')} color={linkHoverColor}>
        <Menu>
          <NavButton link="/dashboard" icon={<IconNav name="icon-laptop"/>} label="Home" />
        </Menu>

        <Menu>
          <NavButton link="/events" icon={<IconNav name="icon-laptop"/>} label="Events" />
        </Menu>

        <Menu>
          <NavButton link="/assets/page/1" icon={<IconNav name="icon-laptop"/>} label="Devices" />
        </Menu>

        <Menu>
          <NavButton link="/users" icon={<IconNav name="icon-user"/>} label="Users" />
        </Menu>

        <Menu>
          <NavButton link="/auth/logout" icon={<IconNav name="icon-cog"/>} label="Logout" />
        </Menu>
      </Flex>
    )
}

export default Nav;