const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Express 앱 설정
const app = express();
const port = 3000;

// 데이터베이스 설정 (SQLite)
const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
    console.error("데이터베이스 연결 오류:", err);
    } else {
    console.log("SQLite 데이터베이스 연결 성공");
    }
});

// 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS fingerprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint_id INTEGER
)`);

// 미들웨어 설정
app.use(bodyParser.json());
app.use(express.static("public")); // public 폴더를 정적 파일 제공 폴더로 설정

// API 엔드포인트

// 지문 등록 (아두이노에서 POST 요청)
app.post("/fingerprints/register", (req, res) => {
  const { fingerprint_id } = req.body;
  if (!fingerprint_id) {
    return res.status(400).send({ message: "지문 ID가 필요합니다." });
  }

  // 데이터베이스에 지문 저장
  db.run(
    "INSERT INTO fingerprints (fingerprint_id) VALUES (?)",
    [fingerprint_id],
    function (err) {
      if (err) {
        return res
          .status(500)
          .send({ message: "지문 등록 실패", error: err.message });
      }
      res.status(201).send({ message: "지문 등록 성공", id: this.lastID });
    }
  );
});

// 등록된 지문 확인
app.get("/fingerprints", (req, res) => {
  db.all("SELECT * FROM fingerprints", [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "지문 조회 실패", error: err.message });
    }
    res.status(200).send({ fingerprints: rows });
  });
});

// 지문 삭제
app.delete("/fingerprints/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM fingerprints WHERE id = ?", [id], function (err) {
    if (err) {
      return res
        .status(500)
        .send({ message: "지문 삭제 실패", error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).send({ message: "지문을 찾을 수 없습니다." });
    }
    res.status(200).send({ message: "지문 삭제 성공" });
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
