/**
 * Script để kill process đang sử dụng port cụ thể
 * Sử dụng: node api/scripts/kill-port.js [port]
 * Mặc định: port 5001
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const port = process.argv[2] || '5001';

async function killPort(port) {
  try {
    console.log(`🔍 Đang tìm process sử dụng port ${port}...`);
    
    // Windows: netstat -ano | findstr :port
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout.trim()) {
      console.log(`✅ Port ${port} không có process nào đang sử dụng.`);
      return;
    }

    // Parse PID từ output
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    for (const line of lines) {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match) {
        pids.add(match[1]);
      }
    }

    if (pids.size === 0) {
      console.log(`⚠️  Không tìm thấy PID từ port ${port}`);
      return;
    }

    console.log(`📋 Tìm thấy ${pids.size} process(es) trên port ${port}:`);
    for (const pid of pids) {
      console.log(`   - PID: ${pid}`);
    }

    // Kill từng process
    for (const pid of pids) {
      try {
        console.log(`🛑 Đang kill process ${pid}...`);
        await execAsync(`taskkill /PID ${pid} /F`);
        console.log(`✅ Đã kill process ${pid}`);
      } catch (error) {
        console.log(`⚠️  Không thể kill process ${pid}: ${error.message}`);
      }
    }

    console.log(`\n✅ Hoàn tất! Port ${port} đã được giải phóng.`);
  } catch (error) {
    if (error.message.includes('findstr')) {
      console.log(`✅ Port ${port} không có process nào đang sử dụng.`);
    } else {
      console.error(`❌ Lỗi: ${error.message}`);
    }
  }
}

killPort(port);
