"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseIfNotExists = exports.runDatabaseDiagnostics = exports.DatabaseDiagnostics = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
class DatabaseDiagnostics {
    constructor() {
        this.host = process.env.DB_HOST || "localhost";
        this.port = parseInt(process.env.DB_PORT || "3306");
        this.username = process.env.DB_USERNAME || "root";
        this.password = process.env.DB_PASSWORD || "";
        this.database = process.env.DB_DATABASE || process.env.DB_NAME || "deukgeun_db";
    }
    async runFullDiagnostics() {
        console.log("=".repeat(80));
        console.log("🔍 DATABASE DIAGNOSTICS START");
        console.log("=".repeat(80));
        await this.checkServerConnection();
        await this.checkDatabaseExists();
        await this.checkUserPermissions();
        await this.checkNetworkConnectivity();
        await this.suggestSolutions();
        console.log("=".repeat(80));
        console.log("🔍 DATABASE DIAGNOSTICS END");
        console.log("=".repeat(80));
    }
    async checkServerConnection() {
        console.log("🔄 Step 1: Checking MySQL server connection...");
        try {
            const connection = await promise_1.default.createConnection({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                connectTimeout: 5000
            });
            await connection.ping();
            await connection.end();
            console.log("✅ MySQL server is accessible");
            console.log(`   - Host: ${this.host}:${this.port}`);
            console.log(`   - User: ${this.username}`);
        }
        catch (error) {
            console.log("❌ MySQL server connection failed");
            console.log(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
            if (error instanceof Error) {
                if (error.message.includes('ECONNREFUSED')) {
                    console.log("   - Issue: Connection refused");
                    console.log("   - Solution: Check if MySQL service is running");
                }
                else if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
                    console.log("   - Issue: Access denied");
                    console.log("   - Solution: Check username and password");
                }
                else if (error.message.includes('ETIMEDOUT')) {
                    console.log("   - Issue: Connection timeout");
                    console.log("   - Solution: Check network connectivity and firewall");
                }
            }
        }
    }
    async checkDatabaseExists() {
        console.log("🔄 Step 2: Checking if database exists...");
        try {
            const connection = await promise_1.default.createConnection({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                connectTimeout: 5000
            });
            const [rows] = await connection.execute("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?", [this.database]);
            await connection.end();
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`✅ Database '${this.database}' exists`);
            }
            else {
                console.log(`❌ Database '${this.database}' does not exist`);
                console.log(`   - Solution: Create database with: CREATE DATABASE ${this.database};`);
            }
        }
        catch (error) {
            console.log("❌ Failed to check database existence");
            console.log(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async checkUserPermissions() {
        console.log("🔄 Step 3: Checking user permissions...");
        try {
            const connection = await promise_1.default.createConnection({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                connectTimeout: 5000
            });
            const [rows] = await connection.execute("SELECT User, Host FROM mysql.user WHERE User = ?", [this.username]);
            await connection.end();
            if (Array.isArray(rows) && rows.length > 0) {
                console.log(`✅ User '${this.username}' exists`);
                console.log(`   - Hosts: ${rows.map((row) => row.Host).join(', ')}`);
            }
            else {
                console.log(`❌ User '${this.username}' does not exist`);
                console.log(`   - Solution: Create user with: CREATE USER '${this.username}'@'localhost' IDENTIFIED BY 'password';`);
            }
        }
        catch (error) {
            console.log("❌ Failed to check user permissions");
            console.log(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async checkNetworkConnectivity() {
        console.log("🔄 Step 4: Checking network connectivity...");
        try {
            const connection = await promise_1.default.createConnection({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                connectTimeout: 3000
            });
            const startTime = Date.now();
            await connection.ping();
            const endTime = Date.now();
            await connection.end();
            console.log(`✅ Network connectivity is good`);
            console.log(`   - Response time: ${endTime - startTime}ms`);
        }
        catch (error) {
            console.log("❌ Network connectivity issues");
            console.log(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async suggestSolutions() {
        console.log("🔄 Step 5: Suggested solutions...");
        console.log("💡 Common solutions:");
        console.log("   1. Start MySQL service:");
        console.log("      - Windows: net start mysql");
        console.log("      - Linux/Mac: sudo systemctl start mysql");
        console.log("   2. Create database:");
        console.log(`      - mysql -u ${this.username} -p -e "CREATE DATABASE ${this.database};"`);
        console.log("   3. Grant permissions:");
        console.log(`      - mysql -u root -p -e "GRANT ALL PRIVILEGES ON ${this.database}.* TO '${this.username}'@'localhost';"`);
        console.log("   4. Check firewall settings");
        console.log("   5. Verify MySQL configuration in my.cnf");
        console.log("   6. Check if port 3306 is available");
    }
    async createDatabaseIfNotExists() {
        console.log("🔄 Attempting to create database if it doesn't exist...");
        try {
            const connection = await promise_1.default.createConnection({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                connectTimeout: 5000
            });
            await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${this.database}\``);
            await connection.end();
            console.log(`✅ Database '${this.database}' created or already exists`);
            return true;
        }
        catch (error) {
            console.log(`❌ Failed to create database '${this.database}'`);
            console.log(`   - Error: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }
}
exports.DatabaseDiagnostics = DatabaseDiagnostics;
const runDatabaseDiagnostics = async () => {
    const diagnostics = new DatabaseDiagnostics();
    await diagnostics.runFullDiagnostics();
};
exports.runDatabaseDiagnostics = runDatabaseDiagnostics;
const createDatabaseIfNotExists = async () => {
    const diagnostics = new DatabaseDiagnostics();
    return await diagnostics.createDatabaseIfNotExists();
};
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
