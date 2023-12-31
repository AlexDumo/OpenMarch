const { app, dialog, Menu, shell } = require('electron');
import * as mainProcess from './index';

interface MenuItem {
  label: string;
  accelerator?: string;
  role: string;
  type?: string;
  submenu?: MenuItem[];
}

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: 'CommandOrControl+O',
        click(item:any, focusedWindow:any) {
        //   if (focusedWindow) {
        //     return mainProcess.getFileFromUser(focusedWindow);
        //   }

        //   const newWindow = mainProcess.createWindow();

        //   newWindow.on('show', () => {
        //     mainProcess.getFileFromUser(newWindow);
        //   });
          mainProcess.loadFile();
        },
      },
      { type: 'separator' },
      {
        label: 'Create New',
        accelerator: 'CommandOrControl+N',
        click() {
          mainProcess.newFile();
        }
      },
      {
        label: 'Save As Copy',
        accelerator: 'CommandOrControl+S',
        click(item:any, focusedWindow:any) {
          if (!focusedWindow) {
            return dialog.showErrorBox(
              'Cannot Save or Export',
              'There is currently no active document to save or export.'
            );
          }
          mainProcess.saveFile();
        },
      },
      // {
      //   label: 'Export HTML',
      //   accelerator: 'Shift+CommandOrControl+S',
      //   click(item:any, focusedWindow:any) {
      //     if (!focusedWindow) {
      //       return dialog.showErrorBox(
      //         'Cannot Save or Export',
      //         'There is currently no active document to save or export.'
      //       );
      //     }
      //     focusedWindow.webContents.send('save-html');
      //   },
      // },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {label: "None of this works yet"},
      { type: 'separator' },
      {
        label: 'Undo',
        accelerator: 'CommandOrControl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CommandOrControl+Z',
        role: 'redo',
      },
      { type: 'separator' },
      {
        label: 'Cut',
        accelerator: 'CommandOrControl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CommandOrControl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CommandOrControl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CommandOrControl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CommandOrControl+M',
        role: 'minimize',
      },
      {
        label: 'Close',
        accelerator: 'CommandOrControl+W',
        role: 'close',
      },
      {
        label: 'Refresh',
        accelerator: 'CommandOrControl+R',
        click(item: any, focusedWindow: any) {
          if (focusedWindow) {
            // Reload the current window
            focusedWindow.reload();
          }
        },
      },
    ],
  },
    {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Visit Website',
        click() { /* To be implemented */ }
      },
      {
        label: 'Toggle Developer Tools',
        click(item:any, focusedWindow:any) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools();
        }
      }
    ],
  }
];

if (process.platform === 'darwin') {
  const name = 'OpenMarch';
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: 'about',
        accelerator: '',
      },
      { type: 'separator' },
      {
        label: 'Services',
        role: 'services',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        submenu: [{ label: 'No Services', enabled: false}],
      },
      { type: 'separator' },
      {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide',
        accelerator: '',
      },
      { type: 'separator' },
      {
        label: `Quit ${name}`,
        accelerator: 'Command+Q',
        click() { app.quit(); }, // A
      },
    ],
  });

  const windowMenu = template.find(item => item.label === 'Window'); // B
  if (!windowMenu) throw new Error(`Menu template does not have a submenu item 'Window'`);
  windowMenu.role = 'window';
  windowMenu.submenu.push(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    { type: 'separator' },
    {
      label: 'Bring All to Front',
      role: 'front',
    }
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// module.exports = Menu.buildFromTemplate(template);
export const applicationMenu = Menu.buildFromTemplate(template);
