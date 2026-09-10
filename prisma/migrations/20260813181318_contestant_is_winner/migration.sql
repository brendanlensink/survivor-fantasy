-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Contestant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tribe" TEXT NOT NULL,
    "photoUrl" TEXT,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    "bootedEp" INTEGER,
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Contestant" ("bootedEp", "createdAt", "id", "isEliminated", "name", "photoUrl", "tribe") SELECT "bootedEp", "createdAt", "id", "isEliminated", "name", "photoUrl", "tribe" FROM "Contestant";
DROP TABLE "Contestant";
ALTER TABLE "new_Contestant" RENAME TO "Contestant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
