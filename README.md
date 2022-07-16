# indexedDB
indexedDB的API封装

# 前言
浏览器存储方式cookie、localStorage、sessionStorage都不适合存储大量数据。

indexedDB 就是浏览器提供的本地数据库，它可以被网页脚本创建和操作。IndexedDB 允许储存大量数据，提供查找接口，还能建立索引

# 特点
键值对存储：采用对象仓库存储数据，所有类型的数据都可以存储，主键唯一。
异步操作：操作采用异步的方式，防止大量的数据操作影响页面性能。
支持事务：要么全部成功，要么全部失败。
同源限制：不能跨域访问。
存储量大：大小取决于硬件，一般不少于 250M。
支持二进制：支持二进制存储


# indexedDB对象

### indexedDB.open(name, version)
打开数据库，是一个异步的操作，但是会同步返回一个 IDBOpenDBRequest对象。
4种事件：success、error、upgradeneeded、blocked

### indexedDB.deleteDatabase(name)
删除数据库，是一个异步的操作，但是会同步返回一个 IDBOpenDBRequest对象
2种事件：success、error

### indexedDB.cmp()
比较两个值是否为indexedDB的相同的主键
返回值
0相同，1第一个主键大于第二个主键，-1第一个主键小于第二个主键

---

# IDBRequest对象
### IDBRequest
表示打开的数据库链接。这个对象的所有操作都是异步操作，要通过 readyState 属性判断是否完成

IDBRequest.readyState：等于 pending 表示操作正在进行，等于 done 表示操作正在完成。

IDBRequest.result：返回请求的结果。如果请求失败、结果不可用，读取该属性会报错。

IDBRequest.error：请求失败时，返回错误对象。

IDBRequest.source：返回请求的来源（比如索引对象或 ObjectStore）。

IDBRequest.transaction：返回当前请求正在进行的事务，如果不包含事务，返回 null。

IDBRequest.onsuccess：指定 success 事件的监听函数。

IDBRequest.onerror：指定 error 事件的监听函数。

### IDBOpenDBRequest对象
继承了 IDBRequest 对象，提供了两个额外的事件监听属性

IDBOpenDBRequest.onblocked：指定 blocked 事件（upgradeneeded 事件触发时，数据库仍然在使用）的监听函数。

IDBOpenDBRequest.onupgradeneeded：upgradeneeded 事件的监听函数

---
# IDBDatabase
打开数据成功以后，可以从 IDBOpenDBRequest 对象的 result 属性上面，拿到一个 IDBDatabase 对象，它表示连接的数据库。后面对数据库的操作，都通过这个对象完成。

### 属性
IDBDatabase.name：字符串，数据库名称。
IDBDatabase.version：整数，数据库版本。数据库第一次创建时，该属性为空字符串。
IDBDatabase.objectStoreNames：DOMStringList 对象（字符串的集合），包含当前数据的所有 object store 的名字。
IDBDatabase.onabort：指定 abort 事件（事务中止）的监听函数。
IDBDatabase.onclose：指定 close 事件（数据库意外关闭）的监听函数。
IDBDatabase.onerror：指定 error 事件（访问数据库失败）的监听函数。
IDBDatabase.onversionchange：数据库版本变化时触发（发生 upgradeneeded 事件，或调用 indexedDB.deleteDatabase()）

### 方法
IDBDatabase.close()：关闭数据库连接，实际会等所有事务完成后再关闭。
IDBDatabase.createObjectStore()：创建存放数据的对象仓库，类似于传统关系型数据库的表格，返回一个 IDBObjectStore 对象。该方法只能在 versionchange 事件监听函数中调用。
IDBDatabase.deleteObjectStore()：删除指定的对象仓库。该方法只能在 versionchange 事件监听函数中调用。
IDBDatabase.transaction()：返回一个 IDBTransaction 事务对象

---
# IDBObjectStore对象
IDBObjectStore 对象对应一个对象仓库（object store）。IDBDatabase.createObjectStore()方法返回的就是一个 IDBObjectStore 对象。 IDBDatabase 对象的 transaction()返回一个事务对象，该对象的 objectStore()方法返回 IDBObjectStore 对象，因此可以采用下面的链式写法。

### 属性
IDBObjectStore.indexNames：返回一个类似数组的对象（DOMStringList），包含了当前对象仓库的所有索引。
IDBObjectStore.keyPath：返回当前对象仓库的主键。
IDBObjectStore.name：返回当前对象仓库的名称。
IDBObjectStore.transaction：返回当前对象仓库所属的事务对象。
IDBObjectStore.autoIncrement：布尔值，表示主键是否会自动递增。

### 方法
IDBObjectStore.add(value, key)
添加数据，返回一个 IDBRequest 对象
第一个参数是键值;第二个参数是主键，该参数可选，如果省略默认为 null

IDBObjectStore.put(item, key)
更新某个主键对应的数据记录，如果键值不存在，插入一条新的记录。返回一个 IDBRequest 对象
第一个参数为新数据;第二个参数为主键，该参数可选，且只在自动递增时才有必要提供，因为那时主键不包含在数据值里面

IDBObjectStore.clear()
删除当前对象仓库的所有记录。返回一个 IDBRequest 对象

IDBObjectStore.delete(key)
删除指定主键的记录。返回一个 IDBRequest 对象。

IDBObjectStore.count()
计算记录的数量。返回一个 IDBRequest 对象
不带参数时，返回当前对象仓库的所有记录数量;
如果主键或 IDBKeyRange 对象作为参数，则返回对应的记录数量

IDBObjectStore.getKey()
获取主键。返回一个 IDBRequest 对象。
方法的参数可以是主键值或IDBKeyRange对象。

IDBObjectStore.get(key)
获取主键对应的数据记录。返回一个 IDBRequest 对象。
```
// 获取所有记录
objectStore.getAll()
// 获取所有符合指定主键或 IDBKeyRange 的记录
objectStore.getAll(query)
// 指定获取记录的数量
objectStore.getAll(query, count)
```

IDBObjectStore.getAllKeys()
用于获取所有符合条件的主键,返回一个 IDBRequest 对象。
```
// 获取所有记录的主键
objectStore.getAllKeys()
// 获取所有符合条件的主键
objectStore.getAllKeys(query)
// 指定获取主键的数量
objectStore.getAllKeys(query, count)
```

IDBObjectStore.index()

IDBObjectStore.createIndex(indexName, keyPath, objectParameters)
新建当前数据库的一个索引,只能在versionChange监听函数里面调用
indexName：索引名
keyPath：主键
objectParameters：配置对象（可选
unique：如果设为 true，将不允许重复的值
multiEntry：如果设为 true，对于有多个值的主键数组，每个值将在索引里面新建一个条目，否则主键数组对应一个条目。

IDBObjectStore.deleteIndex(indexName)
删除指定的索引

IDBObjectStore.openCursor()
用于获取一个指针对象,指针对象可以用来遍历数据。该对象也是异步的，有自己的 success 和 error 事件，可以对它们指定监听函数

IDBObjectStore.openKeyCursor()
用于获取一个主键指针对象

# IDBTransaction对象
IDBTransaction 对象用来异步操作数据库事务，所有的读写操作都要通过这个对象进行。

### 属性
IDBTransaction.db：返回当前事务所在的数据库对象 IDBDatabase。
IDBTransaction.error：返回当前事务的错误。如果事务没有结束，或者事务成功结束，或者被手动终止，该方法返回 null。
IDBTransaction.mode：返回当前事务的模式，默认是 readonly（只读），另一个值是 readwrite。
IDBTransaction.objectStoreNames：返回一个类似数组的对象 DOMStringList，成员是当前事务涉及的对象仓库的名字。
IDBTransaction.onabort：指定 abort 事件（事务中断）的监听函数。
IDBTransaction.oncomplete：指定 complete 事件（事务成功）的监听函数。
IDBTransaction.onerror：指定 error 事件（事务失败）的监听函数。

### 方法
IDBTransaction.abort()：终止当前事务，回滚所有已经进行的变更。
IDBTransaction.objectStore(name)：返回指定名称的对象仓库 IDBObjectStore

# IDBIndex 对象
IDBIndex 对象代表数据库的索引，通过这个对象可以获取数据库里面的记录。数据记录的主键默认就是带有索引，IDBIndex 对象主要用于通过除主键以外的其他键，建立索引获取对象。 IDBIndex 是持久性的键值对存储。只要插入、更新或删除数据记录，引用的对象库中的记录，索引就会自动更新

### 属性
IDBIndex.name：字符串，索引的名称。
IDBIndex.objectStore：索引所在的对象仓库。
IDBIndex.keyPath：索引的主键。
IDBIndex.multiEntry：布尔值，针对 keyPath 为数组的情况，如果设为 true，创建数组时，每个数组成员都会有一个条目，否则每个数组都只有一个条目。
IDBIndex.unique：布尔值，表示创建索引时是否允许相同的主键

### 方法
IDBIndex.count()：用来获取记录的数量。它可以接受主键或 IDBKeyRange 对象作为参数，这时只返回符合主键的记录数量，否则返回所有记录的数量。
IDBIndex.get(key)：用来获取符合指定主键的数据记录。
IDBIndex.getKey(key)：用来获取指定的主键。
IDBIndex.getAll()：用来获取所有的数据记录。它可以接受两个参数，都是可选的，第一个参数用来指定主键，第二个参数用来指定返回记录的数量。如果省略这两个参数，则返回所有记录。由于获取成功时，浏览器必须生成所有对象，所以对性能有影响。如果数据集比较大，建议使用 IDBCursor 对象。
IDBIndex.getAllKeys()：该方法与 IDBIndex.getAll()方法相似，区别是获取所有主键。
IDBIndex.openCursor()：用来获取一个 IDBCursor 对象，用来遍历索引里面的所有条目。
IDBIndex.openKeyCursor()：该方法与 IDBIndex.openCursor()方法相似，区别是遍历所有条目的主键

# IDBCursor 
IDBCursor 对象代表指针对象，用来遍历数据仓库（IDBObjectStore）或索引（IDBIndex）的记录。 IDBCursor 对象一般通过 IDBObjectStore.openCursor()方法获得

### 属性
IDBCursor.source：返回正在遍历的对象仓库或索引。
IDBCursor.direction：字符串，表示指针遍历的方向。共有四个可能的值：next（从头开始向后遍历）、nextunique（从头开始向后遍历，重复的值只遍历一次）、prev（从尾部开始向前遍历）、prevunique（从尾部开始向前遍历，重复的值只遍历一次）。该属性通过 IDBObjectStore.openCursor()方法的第二个参数指定，一旦指定就不能改变了。
IDBCursor.key：返回当前记录的主键。
IDBCursor.value：返回当前记录的数据值。
IDBCursor.primaryKey：返回当前记录的主键。对于数据仓库（objectStore）来说，这个属性等同于 IDBCursor.key；对于索引，IDBCursor.key 返回索引的位置值，该属性返回数据记录的主键。


### 方法

IDBCursor.advance(n)：指针向前移动 n 个位置。
IDBCursor.continue()：指针向前移动一个位置。它可以接受一个主键作为参数，这时会跳转到这个主键。
IDBCursor.continuePrimaryKey()：该方法需要两个参数，第一个是 key，第二个是 primaryKey，将指针移到符合这两个参数的位置。
IDBCursor.delete()：用来删除当前位置的记录，返回一个 IDBRequest 对象。该方法不会改变指针的位置。
IDBCursor.update()：用来更新当前位置的记录，返回一个 IDBRequest 对象。它的参数是要写入数据库的新的值


# IDBKeyRange对象
IDBKeyRange 对象代表数据仓库（object store）里面的一组主键。根据这组主键，可以获取数据仓库或索引里面的一组记录。 IDBKeyRange 可以只包含一个值，也可以指定上限和下限

对象静态方法
IDBKeyRange.lowerBound()：指定下限。
IDBKeyRange.upperBound()：指定上限。
IDBKeyRange.bound()：同时指定上下限。
IDBKeyRange.only()：指定只包含一个值。

只读属性
IDBKeyRange.lower：返回下限
IDBKeyRange.lowerOpen：布尔值，表示下限是否为开区间（即下限是否排除在范围之外）
IDBKeyRange.upper：返回上限
IDBKeyRange.upperOpen：布尔值，表示上限是否为开区间（即上限是否排除在范围之外） IDBKeyRange 实例对象生成以后，将它作为参数输入 IDBObjectStore 或 IDBIndex 对象的 openCursor()方法，就可以在所设定的范围内读取数据





createObjectStore(obname, {keyPath: "id", autoIncrement: true}); 
keyPath主键
autoIncrement自增

createIndex('key','key',{unique: false})

数据库：IDBDatabase 对象
操作请求：IDBRequest 对象
主键集合：IDBKeyRange 对象

