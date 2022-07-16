const attrs = [
  {
    code: 'dbName',
    desc: '数据库名',
    required: true,
    type: 'String',
    default: '',
  },
  {
    code: 'version',
    desc: '数据库版本号',
    required: false,
    type: 'Number',
    default: 1,
  },
  {
    code: 'storeName',
    desc: '对象仓库名',
    required: true,
    type: 'String',
    default: '',
  },
  {
    code: 'keyPath',
    desc: '对象仓库主键',
    required: false,
    type: 'String',
    default: 'id'
  },
  {
    code: 'autoIncrement',
    desc: '主键是否自增',
    required: false,
    type: 'Booleab',
    default: false,
  },
  {
    code: 'indexList',
    desc: '索引数据',
    required: true,
    type: 'Array',
    default: [],
  }
];

const getAttrDefault = configCode => {
  return attrs.find(item => item.code === configCode);
}

export default class IDB {
  dbName = getAttrDefault('dbName').default

  version = getAttrDefault('version').default

  storeName = getAttrDefault('storeName').default

  keyPath = getAttrDefault('keyPath').default

  autoIncrement = getAttrDefault('autoIncrement').default

  indexList = getAttrDefault('indexList').default

  db = null

  constructor(config) {
    if (!window.indexedDB) {
      throw Error('不支持indexDB');
    }
    this.checkConfig(config)
    this.dbName = config.dbName;
    this.versopm = config.version || this.versopm;
    this.storeName = config.storeName;
    this.keyPath = config.keyPath || this.keyPath;
    this.autoIncrement = config.autoIncrement || this.autoIncrement
    this.indexList = config.indexList;
  }

  // 校验配置项
  checkConfig = (config) => {
    attrs.forEach(attr => {
      if (attr.required && !config[attr.code]) {
        throw Error(`缺少配置项${attr.code}`);
      }
      if (config[attr.code] && attr.type !== 'Array' && ((typeof config[attr.code]) !== attr.type.toLocaleLowerCase())) {
        throw TypeError(`配置项${attr.code}类型错误，类型应为${attr.type.toLocaleLowerCase()}`);
      }
      if (config[attr.code] && attr.type === 'Array' && !Array.isArray(config[attr.code])) {
        throw TypeError(`配置项${attr.code}类型错误，应该为数组`);
      }
    });
  }

  // 初始化
  openDB = () => {
    console.log('openDB');
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = (event) => {
        console.log('onupgradeneeded', event);
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: this.keyPath, autoIncrement: this.autoIncrement });
          this.indexList.forEach(index => {
            if (typeof index === 'string') {
              objectStore.createIndex(index, index);
            }
            if (typeof index === 'object') {
              objectStore.createIndex(index.indexName, index.keyPath, { ...index.config });
            }
          })
        }
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  // 删除
  deleteDB = async (dbName) => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(dbName || this.dbName);
      request.onsuccess = (event) => {
        resolve(event);
      };
      request.onerror = (event) => {
        reject(event);
      }
    });
  }

  // 关闭db对象，之后无法对其进行插入、删除操作
  closeDB = () => {
    this.db.close();
  }

  // 对象仓库添加数据
  add = (data) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).add(data);
      request.onsuccess = event => {
        console.log('add success', event);
        resolve(data);
      };
      request.onerror = event => {
        console.log('add error', event);
        reject(event);
      };
    });
  }

  // 对象仓库清除数据
  clear = (data) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).clear();
      request.onsuccess = event => {
        console.log('clear success', event);
        resolve(data);
      };
      request.onerror = event => {
        console.log('clear error', event);
        reject(event);
      };
    });
  }

  // 对象仓库数据数量
  count = () => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).count();
      request.onerror = event => {
        console.log('count error', event);
        reject(event);
      };
      request.onsuccess = event => {
        console.log('count success', event);
        resolve(event.target.result);
      };
    });
  }

  // 对象仓库通过主键删除数据
  delete = (key) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).delete(key);
      request.onerror = event => {
        console.log('delete error', event);
        reject(event);
      };
      request.onsuccess = event => {
        console.log('delete success', event);
        resolve(event.target.result);
      };
    });
  }

  // 对象仓库通过主键获取数据
  get = (key) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).get(key);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        console.log('get success', event);
        resolve(event.target.result);
      };
    });
  }

  getAll = (...rest) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).getAll(...rest);
      request.onerror = event => {
        reject(event);
      };
      request.onsuccess = event => {
        console.log('getAll success', event);
        resolve(event.target.result);
      };
    });
  }

  // 对象仓库编辑/新增数据
  put = (data) => {
    return new Promise((resolve, reject) => {
      const request = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName).put(data);
      request.onsuccess = event => {
        console.log('put success', event);
        resolve(data);
      };
      request.onerror = event => {
        console.log('put error', event);
        reject(event);
      };
    });
  }

  // getAllKeys
  // getKey
  // index
  // deletIndex
  // openCursor()
  // openKeyCursor()

  // getAll = () => {
  //   const result = [];
  //   return new Promise((resolve, reject) => {
  //     const objectStore = this.db.transaction(this.name).objectStore(this.name);
  //     objectStore.openCursor().onsuccess = event => {
  //       const data = event.target.result;
  //       if (data) {
  //         result.push(data.id);
  //         data.continue();
  //       } else {
  //         resolve(result);
  //       }
  //     };
  //     objectStore.openCursor().onerror = event => {
  //       reject(event);
  //     };
  //   });
  // }
}