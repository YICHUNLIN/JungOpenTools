
const {createServer} = require('http');
const {Server} = require('socket.io');
const express = require('express')

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 在生產環境中請設置更嚴格的來源
  }
});

// 用來儲存使用者 ID 和 socket ID 的對應關係
// 在實際應用中，建議使用 Redis 或資料庫來儲存，以應對多伺服器擴展
const users = {};

io.on('connection', (socket) => {
  console.log(`一個新客戶端連接了: ${socket.id}`);

  // 1. 使用者登入/註冊
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    socket.userId = userId; // 將 userId 綁定到 socket 物件上，方便後續操作
    console.log(`使用者 ${userId} 已註冊，對應的 socket.id 是 ${socket.id}`);
    console.log('目前線上使用者:', users);
    // 向所有客戶端廣播最新的線上使用者列表
    io.emit('updateUserList', Object.keys(users));
  });

  // 2. 加入群組房間
  socket.on('joinGroupRoom', (roomName) => {
    socket.join(roomName);
    console.log(`使用者 ${socket.userId} (${socket.id}) 加入了群組房間: ${roomName}`);
    // 通知房間內除了自己以外的人
    socket.to(roomName).emit('groupMessage', {
      sender: '系統訊息',
      message: `使用者 ${socket.userId} 已加入房間。`
    });
  });

  // 3. 處理群組訊息
  socket.on('groupMessage', ({ roomName, message }) => {
    console.log(`收到來自 ${socket.userId} 在 ${roomName} 的訊息: ${message}`);
    // 向房間內除了自己以外的所有人廣播訊息
    socket.to(roomName).emit('groupMessage', {
      sender: socket.userId,
      message: message
    });
  });

  // 4. 處理一對一私訊
  socket.on('privateMessage', ({ recipientId, message }) => {
    const recipientSocketId = users[recipientId];
    if (recipientSocketId) {
      console.log(`發送私訊從 ${socket.userId} 到 ${recipientId} (socket: ${recipientSocketId})`);
      // 直接發送到目標 socket.id 對應的那個房間
      io.to(recipientSocketId).emit('privateMessage', {
        sender: socket.userId,
        message: message
      });
    } else {
      console.log(`無法發送私訊: 使用者 ${recipientId} 不在線上。`);
      // 可以選擇通知發送者，對方已離線
      socket.emit('systemNotification', {
        message: `傳送失敗：使用者 ${recipientId} 目前不在線上。`
      });
    }
  });


  // 5. 處理斷開連接
  socket.on('disconnect', () => {
    console.log(`客戶端 ${socket.id} 已斷開`);
    if (socket.userId) {
      // 從使用者列表中移除
      delete users[socket.userId];
      console.log(`使用者 ${socket.userId} 已離線`);
      console.log('目前線上使用者:', users);
      // 再次廣播最新的使用者列表
      io.emit('updateUserList', Object.keys(users));
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
});