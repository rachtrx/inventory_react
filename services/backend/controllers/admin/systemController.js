const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

class SystemController {

    cleanupLocalBackups = (dir, daysOld = 7) => {
        const now = Date.now();
        const cutoff = daysOld * 24 * 60 * 60 * 1000;
      
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          if ((now - stats.mtimeMs) > cutoff) {
            fs.unlinkSync(filePath);
            console.log(`Deleted old backup: ${file}`);
          }
        });
    };

    exportDb = async () => {
        const backupDir = process.env.LOCAL_BACKUP_PATH
        const fileName = `backup_${new Date().toISOString().split('T')[0]}.sql`;
        const fullPath = path.join(backupDir, fileName);
      
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir);
        }
      
        const command = `pg_dump -U ${process.env.POSTGRES_USER} -h ${process.env.DATABASE_HOST} -d ${process.env.POSTGRES_DB} -f ${fullPath}`;
        exec(command, { env: { ...process.env, PGPASSWORD: process.env.POSTGRES_PASSWORD } }, (err, stdout, stderr) => {
          if (err) console.error('Backup failed', err);
          else console.log('Backup created:', fullPath);
        });
      
        return fullPath;
    };

    uploadToSharePoint = async (filePath, fileName, accessToken) => {
        const fileStream = fs.createReadStream(filePath);
      
        const driveId = process.env.DRIVE_ID; 
        const path = process.env.REMOTE_BACKUP_PATH
        const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${path}/${fileName}:/content`;
      
        const res = await axios.put(uploadUrl, fileStream, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/octet-stream',
          }
        });
      
        return res.data;
    };

    deleteFromSharePoint = async (fileName, accessToken) => {
        const driveId = process.env.DRIVE_ID;
        const path = process.env.REMOTE_BACKUP_PATH
        const deleteUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${path}/${fileName}`;
      
        await axios.delete(deleteUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      
        console.log(`Deleted from SharePoint: ${fileName}`);
    };

    getAccessToken = async () => {
        const tokenResponse = await axios.post(
          `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
          qs.stringify({
            client_id: process.env.AZURE_CLIENT_ID,
            client_secret: process.env.AZURE_CLIENT_SECRET,
            scope: 'https://graph.microsoft.com/.default',
            grant_type: 'client_credentials',
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
      
        return tokenResponse.data.access_token;
    }
    
    sendSystemEmail = async (to, subject, bodyText) => {
        const token = await getAccessToken();
      
        await axios.post(
          `https://graph.microsoft.com/v1.0/users/${process.env.SENDER_EMAIL}/sendMail`,
          {
            message: {
              subject: subject,
              body: {
                contentType: 'Text',
                content: bodyText,
              },
              // body: {
              //   contentType: 'HTML',
              //   content: '<b>This is bold HTML content</b>',
              // },
              toRecipients: [
                {
                  emailAddress: {
                    address: to,
                  },
                },
              ],
            },
            saveToSentItems: 'true',
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }  
}

module.exports = new SystemController();