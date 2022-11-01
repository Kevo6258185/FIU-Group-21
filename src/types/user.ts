import { randomUUID } from "crypto";
import users from "../mongoDB/schemas/users";

export default class User {
    username: string;
    password: string;
    name: string;
    email: string;
    address: string;
    admin: boolean = false;
    token: string = randomUUID();

    private constructor(username: string, password: string, name: string, email: string, address: string, token?: string, admin?: boolean) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.address = address;
        if (token !== undefined) this.token = token;
        if (admin !== undefined) this.admin = admin;
    }




    static async fromUserAndPass(username: string, password: string) : Promise<any> {
        return new Promise((resolve) => {
            users.findOne({
                username: username,
                password: password,
            }, (err: any, book: any) => {
                resolve(true);
                // todo turn into user class
            });
        });
    }


    async generateNewToken() : Promise<string> {
        this.token = randomUUID();
        await this.save();
        return this.token;
    }

    public async save() : Promise<boolean> { //TODO: add TS types
        let user = await this.findInDB();
        if (user === null) user = new users();

        // Update the user with new data
        user.username = this.username;
        user.password = this.password;
        user.name = this.name;
        user.email = this.email;
        user.address = this.address;
        user.token = this.token;
        user.admin = this.admin;
        
        // Save the book
        try {
            await user.save(); //todo error handling through callback
            return true;
        } catch (ex) {
            return false;
        }
    }

    public async delete() : Promise<boolean> {
        const user = await this.findInDB();
        if (user === null) return false;

        try {
            await user.delete();
            return true;
        } catch (ex) {
            return false;
        }
    }

    public async inDatabase() : Promise<boolean> {
        let user = await this.findInDB();
        return user !== null;
    }

    private async findInDB() : Promise<any> {
        return new Promise((resolve) => {
            users.findOne({username: this.username}, (err: any, user: any) => {
                if (err) resolve(null);
                return resolve(user);
            });
        });
    }

}
