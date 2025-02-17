import { EventEmitter } from 'events';
import { MockBrowserWindow } from './browser-window';
import { MockWebContents } from './web-contents';

const createdNotifications: Array<MockNotification> = [];

class MockNotification extends EventEmitter {
  public readonly show = jest.fn();

  constructor(public readonly options: any) {
    super();
    createdNotifications.push(this);
  }
}

class Screen extends EventEmitter {
  public readonly getDisplayMatching = jest.fn();
  public readonly getDisplayNearestPoint = jest.fn();
  public readonly getPrimaryDisplay = jest.fn();
  public readonly getCursorScreenPoint = jest.fn();
}

class MockAutoUpdater extends EventEmitter {
  public readonly quitAndInstall = jest.fn();
}

export class MockMenu {
  public static readonly setApplicationMenu = jest.fn();
  public static readonly sendActionToFirstResponder = jest.fn();
  public static readonly getApplicationMenu = jest.fn();
  public static readonly buildFromTemplate = jest.fn();
  public readonly popup = jest.fn();
  public readonly closePopup = jest.fn();
  public items: Array<MockMenuItem> = [];
  public append(mi: MockMenuItem) {
    this.items.push(mi);
  }
  public insert(pos: number, mi: MockMenuItem) {
    this.items = this.items.splice(pos, 0, mi);
  }
}

export class MockNativeImage {
  public readonly args: Array<any>;
  constructor(...args: Array<any>) {
    this.args = args;
  }
}

export class MockMenuItem {
  public enabled: boolean;
  public visible: boolean;
  public label: string;
  public type: string;
  public click: (
    menuItem: Electron.MenuItem,
    browserWindow: Electron.BrowserWindow | undefined,
    event: KeyboardEvent,
  ) => void;

  constructor(options: Electron.MenuItemConstructorOptions) {
    this.enabled = !!options.enabled;
    this.label = options.label!;
    this.click = options.click!;
    this.visible = !!options.visible;
    this.type = options.type as string;
  }
}

export class MockIPCMain extends EventEmitter {
  public send: any;
  public handle: any;
  public handleOnce: any;

  constructor() {
    super();
    this.send = jest.fn();
    this.handle = jest.fn();
    this.handleOnce = jest.fn();
  }
}

export class MockIPCRenderer extends EventEmitter {
  public send: any;
  public invoke: any;

  constructor() {
    super();
    this.send = jest.fn();
    this.invoke = jest.fn();
  }
}

function CreateWindowStub() {
  return {
    id: 0,
    setMenuBarVisibility: jest.fn(),
    setAutoHideMenuBar: jest.fn(),
    setIgnoreMouseEvents: jest.fn(),
    setTitle: jest.fn(),
    reload: jest.fn(),
    isDestroyed: jest.fn(() => false),
  };
}

const app = {
  getName: jest.fn().mockReturnValue('Electron Fiddle'),
  exit: jest.fn(),
  hide: jest.fn(),
  show: jest.fn(),
  isDefaultProtocolClient: jest.fn().mockReturnValue(true),
  setAsDefaultProtocolClient: jest.fn(),
  isReady: jest.fn().mockReturnValue(true),
  isInApplicationsFolder: jest.fn().mockReturnValue(true),
  moveToApplicationsFolder: jest.fn(),
  getAppMetrics: jest.fn().mockReturnValue({ metrics: 123 }),
  getGPUFeatureStatus: jest.fn(),
  getJumpListSettings: jest.fn(() => ({
    removedItems: [],
  })),
  getLoginItemSettings: jest.fn(),
  getPath: jest.fn((name: string) => {
    if (name === 'userData') return '/Users/fake-user';
    if (name === 'home') return `~`;
    return '/test-path';
  }),
  focus: jest.fn(),
  quit: jest.fn(),
  relaunch: jest.fn(),
  setJumpList: jest.fn(),
  requestSingleInstanceLock: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  once: jest.fn(),
  whenReady: () => Promise.resolve(),
  removeAllListeners: jest.fn(),
};

const mainWindowStub = CreateWindowStub();
const focusedWindowStub = CreateWindowStub();
const autoUpdater = new MockAutoUpdater();

const session = {
  defaultSession: {
    clearCache: jest.fn((cb) => cb()),
    clearStorageData: jest.fn((_opts, cb) => cb()),
    cookies: {
      get: jest.fn(),
    },
  },
};

const shell = {
  openExternal: jest.fn(),
  openPath: jest.fn(),
  showItemInFolder: jest.fn(),
};

const systemPreferences = {
  getUserDefault: jest.fn(),
};

const electronMock = {
  app,
  autoUpdater,
  BrowserWindow: MockBrowserWindow,
  clipboard: {
    readText: jest.fn(),
    readImage: jest.fn(),
    writeText: jest.fn(),
    writeImage: jest.fn(),
  },
  crashReporter: {
    start: jest.fn(),
  },
  dialog: {
    showOpenDialog: jest.fn().mockResolvedValue({}),
    showOpenDialogSync: jest.fn().mockReturnValue(['path']),
    showMessageBox: jest.fn().mockResolvedValue({}),
  },
  ipcMain: new MockIPCMain(),
  ipcRenderer: new MockIPCRenderer(),
  nativeImage: {
    createFromPath: (...args: Array<any>) => new MockNativeImage(...args),
    createFromBuffer: jest.fn(),
    createFromDataURL: jest.fn(function () {
      return { toPNG: jest.fn(() => 'content') };
    }),
    createEmpty: jest.fn(),
  },
  match: jest.fn(),
  Menu: MockMenu,
  MenuItem: MockMenuItem,
  Notification: MockNotification,
  _notifications: createdNotifications,
  protocol: {
    registerStandardSchemes: jest.fn(),
    registerServiceWorkerSchemes: jest.fn(),
    registerFileProtocol: jest.fn(),
    registerBufferProtocol: jest.fn(),
    registerStringProtocol: jest.fn(),
    registerHttpProtocol: jest.fn(),
    registerStreamProtocol: jest.fn(),
    unregisterProtocol: jest.fn(),
    isProtocolHandled: jest.fn(),
    interceptFileProtocol: jest.fn(),
    interceptStringProtocol: jest.fn(),
    interceptBufferProtocol: jest.fn(),
    interceptHttpProtocol: jest.fn(),
    uninterceptProtocol: jest.fn(),
  },
  require: jest.fn(),
  screen: new Screen(),
  session,
  shell,
  systemPreferences,
  webContents: MockWebContents,
};

electronMock.BrowserWindow.getAllWindows.mockReturnValue([]);
electronMock.BrowserWindow.fromId.mockReturnValue(mainWindowStub);
electronMock.BrowserWindow.fromWebContents.mockReturnValue(mainWindowStub);
electronMock.BrowserWindow.getFocusedWindow.mockReturnValue(focusedWindowStub);

module.exports = electronMock;
