import { Request, Response } from "express";
import authChecker from "../../utils/authChecker";
import response from "../../utils/response";

import Book from "../../types/book";
import Author from "../../types/author";
import { isEmpty } from "../../utils/classUtils";

export default async function(req: Request, res: Response) : Promise<any> {
    
    if (req.headers.authorization === undefined || !authChecker(req.headers.authorization)) 
        return res.status(401).send(response(false, 'Invalid authorization header'));

    if (isEmpty(req.body))
        return res.status(400).send(response(false, 'No data provided'));
    
    // Make a valid book object
    const book : Book | null = Book.fromJSON(req.body);
    if (book === null)
        return res.status(400).send(response(false, 'Invalid book provided'));

    if (await Author.fromID(book.author) === null)
        return res.status(404).send(response(false, 'Book author could not be found'));

    if (await book.inDatabase())
        return res.status(400).send(response(false, 'Book already exists, try updating it instead'));

    // Save the book
    if (await book.save()) return res.status(200).send(response(true, 'Book saved'));
    return res.status(500).send(response(false, 'Internal server error'));
};