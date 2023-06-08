(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(global, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/server/database/migration/1669424617013-initialize.ts":
/*!*******************************************************************!*\
  !*** ./src/server/database/migration/1669424617013-initialize.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.initialize1669424617013 = void 0;
class initialize1669424617013 {
    constructor() {
        this.name = 'initialize1669424617013';
    }
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "permission" ("id" varchar PRIMARY KEY NOT NULL, "name" text NOT NULL, "entityId" text NOT NULL, "actions" integer NOT NULL, "roleId" varchar)`);
            yield queryRunner.query(`CREATE TABLE "role" ("id" varchar PRIMARY KEY NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"))`);
            yield queryRunner.query(`CREATE TABLE "identity" ("id" varchar PRIMARY KEY NOT NULL, "provider_type" text NOT NULL, "provider_hash" text NOT NULL, "provider_access_token" text, "provider_refresh_token" text, "userId" varchar)`);
            yield queryRunner.query(`CREATE TABLE "user" ("id" varchar PRIMARY KEY NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "name" text NOT NULL)`);
            yield queryRunner.query(`CREATE TABLE "api_key" ("secret_key" varchar PRIMARY KEY NOT NULL, "userId" varchar)`);
            yield queryRunner.query(`CREATE TABLE "replicant" ("namespace" text NOT NULL, "name" text NOT NULL, "value" text NOT NULL, PRIMARY KEY ("namespace", "name"))`);
            yield queryRunner.query(`CREATE TABLE "session" ("expiredAt" bigint NOT NULL, "id" varchar(255) PRIMARY KEY NOT NULL, "json" text NOT NULL, "destroyedAt" datetime)`);
            yield queryRunner.query(`CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `);
            yield queryRunner.query(`CREATE TABLE "user_roles_role" ("userId" varchar NOT NULL, "roleId" varchar NOT NULL, PRIMARY KEY ("userId", "roleId"))`);
            yield queryRunner.query(`CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `);
            yield queryRunner.query(`CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `);
            yield queryRunner.query(`CREATE TABLE "temporary_permission" ("id" varchar PRIMARY KEY NOT NULL, "name" text NOT NULL, "entityId" text NOT NULL, "actions" integer NOT NULL, "roleId" varchar, CONSTRAINT "FK_cdb4db95384a1cf7a837c4c683e" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
            yield queryRunner.query(`INSERT INTO "temporary_permission"("id", "name", "entityId", "actions", "roleId") SELECT "id", "name", "entityId", "actions", "roleId" FROM "permission"`);
            yield queryRunner.query(`DROP TABLE "permission"`);
            yield queryRunner.query(`ALTER TABLE "temporary_permission" RENAME TO "permission"`);
            yield queryRunner.query(`CREATE TABLE "temporary_identity" ("id" varchar PRIMARY KEY NOT NULL, "provider_type" text NOT NULL, "provider_hash" text NOT NULL, "provider_access_token" text, "provider_refresh_token" text, "userId" varchar, CONSTRAINT "FK_12915039d2868ab654567bf5181" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
            yield queryRunner.query(`INSERT INTO "temporary_identity"("id", "provider_type", "provider_hash", "provider_access_token", "provider_refresh_token", "userId") SELECT "id", "provider_type", "provider_hash", "provider_access_token", "provider_refresh_token", "userId" FROM "identity"`);
            yield queryRunner.query(`DROP TABLE "identity"`);
            yield queryRunner.query(`ALTER TABLE "temporary_identity" RENAME TO "identity"`);
            yield queryRunner.query(`CREATE TABLE "temporary_api_key" ("secret_key" varchar PRIMARY KEY NOT NULL, "userId" varchar, CONSTRAINT "FK_277972f4944205eb29127f9bb6c" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
            yield queryRunner.query(`INSERT INTO "temporary_api_key"("secret_key", "userId") SELECT "secret_key", "userId" FROM "api_key"`);
            yield queryRunner.query(`DROP TABLE "api_key"`);
            yield queryRunner.query(`ALTER TABLE "temporary_api_key" RENAME TO "api_key"`);
            yield queryRunner.query(`DROP INDEX "IDX_5f9286e6c25594c6b88c108db7"`);
            yield queryRunner.query(`DROP INDEX "IDX_4be2f7adf862634f5f803d246b"`);
            yield queryRunner.query(`CREATE TABLE "temporary_user_roles_role" ("userId" varchar NOT NULL, "roleId" varchar NOT NULL, CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("userId", "roleId"))`);
            yield queryRunner.query(`INSERT INTO "temporary_user_roles_role"("userId", "roleId") SELECT "userId", "roleId" FROM "user_roles_role"`);
            yield queryRunner.query(`DROP TABLE "user_roles_role"`);
            yield queryRunner.query(`ALTER TABLE "temporary_user_roles_role" RENAME TO "user_roles_role"`);
            yield queryRunner.query(`CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `);
            yield queryRunner.query(`CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`DROP INDEX "IDX_4be2f7adf862634f5f803d246b"`);
            yield queryRunner.query(`DROP INDEX "IDX_5f9286e6c25594c6b88c108db7"`);
            yield queryRunner.query(`ALTER TABLE "user_roles_role" RENAME TO "temporary_user_roles_role"`);
            yield queryRunner.query(`CREATE TABLE "user_roles_role" ("userId" varchar NOT NULL, "roleId" varchar NOT NULL, PRIMARY KEY ("userId", "roleId"))`);
            yield queryRunner.query(`INSERT INTO "user_roles_role"("userId", "roleId") SELECT "userId", "roleId" FROM "temporary_user_roles_role"`);
            yield queryRunner.query(`DROP TABLE "temporary_user_roles_role"`);
            yield queryRunner.query(`CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `);
            yield queryRunner.query(`CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `);
            yield queryRunner.query(`ALTER TABLE "api_key" RENAME TO "temporary_api_key"`);
            yield queryRunner.query(`CREATE TABLE "api_key" ("secret_key" varchar PRIMARY KEY NOT NULL, "userId" varchar)`);
            yield queryRunner.query(`INSERT INTO "api_key"("secret_key", "userId") SELECT "secret_key", "userId" FROM "temporary_api_key"`);
            yield queryRunner.query(`DROP TABLE "temporary_api_key"`);
            yield queryRunner.query(`ALTER TABLE "identity" RENAME TO "temporary_identity"`);
            yield queryRunner.query(`CREATE TABLE "identity" ("id" varchar PRIMARY KEY NOT NULL, "provider_type" text NOT NULL, "provider_hash" text NOT NULL, "provider_access_token" text, "provider_refresh_token" text, "userId" varchar)`);
            yield queryRunner.query(`INSERT INTO "identity"("id", "provider_type", "provider_hash", "provider_access_token", "provider_refresh_token", "userId") SELECT "id", "provider_type", "provider_hash", "provider_access_token", "provider_refresh_token", "userId" FROM "temporary_identity"`);
            yield queryRunner.query(`DROP TABLE "temporary_identity"`);
            yield queryRunner.query(`ALTER TABLE "permission" RENAME TO "temporary_permission"`);
            yield queryRunner.query(`CREATE TABLE "permission" ("id" varchar PRIMARY KEY NOT NULL, "name" text NOT NULL, "entityId" text NOT NULL, "actions" integer NOT NULL, "roleId" varchar)`);
            yield queryRunner.query(`INSERT INTO "permission"("id", "name", "entityId", "actions", "roleId") SELECT "id", "name", "entityId", "actions", "roleId" FROM "temporary_permission"`);
            yield queryRunner.query(`DROP TABLE "temporary_permission"`);
            yield queryRunner.query(`DROP INDEX "IDX_4be2f7adf862634f5f803d246b"`);
            yield queryRunner.query(`DROP INDEX "IDX_5f9286e6c25594c6b88c108db7"`);
            yield queryRunner.query(`DROP TABLE "user_roles_role"`);
            yield queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
            yield queryRunner.query(`DROP TABLE "session"`);
            yield queryRunner.query(`DROP TABLE "replicant"`);
            yield queryRunner.query(`DROP TABLE "api_key"`);
            yield queryRunner.query(`DROP TABLE "user"`);
            yield queryRunner.query(`DROP TABLE "identity"`);
            yield queryRunner.query(`DROP TABLE "role"`);
            yield queryRunner.query(`DROP TABLE "permission"`);
        });
    }
}
exports.initialize1669424617013 = initialize1669424617013;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/server/database/migration/1669424617013-initialize.ts"](0, __webpack_exports__);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=1669424617013-initialize.js.map