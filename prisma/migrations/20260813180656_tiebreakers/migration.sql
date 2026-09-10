-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "winnerPredictionId" TEXT,
    "idolsPlayedGuess" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_winnerPredictionId_fkey" FOREIGN KEY ("winnerPredictionId") REFERENCES "Contestant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Team_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("createdAt", "id", "name", "playerId") SELECT "createdAt", "id", "name", "playerId" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
