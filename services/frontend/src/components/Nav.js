import {
  Box,
    Flex,
    IconButton,
    Menu,
    Tooltip,
    useColorModeValue,
  } from '@chakra-ui/react';
import NavButton from "./buttons/NavButton";
import { MdDashboard, MdHistory, MdWork, MdPeople, MdAccountCircle, MdUsb, MdAlarm } from 'react-icons/md'; // react-icons
import { useLocation, useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { useUI } from '../context/UIProvider';

const Nav = () => {
  const navigate = useNavigate();
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const {handleDevError} = useUI();

  return (
    <Flex
      as="nav"
      className="user-nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={linkHoverColor}
    >

      <Menu>
        <NavButton next={() => navigate('/reminders')} icon={<MdAlarm />} label="Reminders" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/history')} icon={<MdHistory />} label="History" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/assets')} icon={<MdWork />} label="Assets" />
      </Menu>
      
      <Menu>
        <NavButton next={() => navigate('/accessories')} icon={<MdUsb />} label="Accessories" />
      </Menu>

      <Menu>
        <NavButton next={() => navigate('/users')} icon={<MdPeople />} label="Users" />
      </Menu>

      <Flex gap={3} align="center">
        <Tooltip label="Stats" hasArrow>
          <Box as="span" display="inline-flex" alignItems="center" justifyContent="center">
            <IconButton
              as={RouterLink}
              to="/stats"
              icon={<MdDashboard />}
              aria-label="Stats"
              variant="ghost"
            />
          </Box>
        </Tooltip>

        <Tooltip label="Profile" hasArrow placement="bottom">
          <Box as="span" display="inline-flex" alignItems="center" justifyContent="center">
            <IconButton
              icon={<MdAccountCircle />}
              aria-label="Profile"
              variant="ghost"
              onClick={() => navigate('/profile')}
            />
          </Box>
        </Tooltip>
      </Flex>

      {/* <Menu>
        <NavButton next={handleDevError} icon={<MdEvent />} label="Reservations" />
      </Menu> */}

    </Flex>
  );
};

export default Nav;

// handleDevError