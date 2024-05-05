import { DevicesContext } from "../../providers/DeviceProvider";
import { useContext } from 'react';

function RegisterDevice() {

    const { devices, setDevices } = useContext(DevicesContext);
    
    const addDevice = (newDevice) => {
        fetch('/api/devices/add', {
          method: 'POST',
          body: JSON.stringify(newDevice),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Update the local state to include the new device
            setDevices(prevDevices => [...prevDevices, newDevice]);
          } else {
            // Handle any errors
            console.error('Error adding device:', data.message);
          }
        })
        .catch(error => {
          console.error('Error adding device:', error);
        });
    };
}


  
export default RegisterDevice