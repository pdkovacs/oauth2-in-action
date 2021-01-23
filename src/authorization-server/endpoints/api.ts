import { Request, Response } from "express";

const group1 = {
    groupName: "group1",
    id: 0,
    members: [
        {
            id: 0,
            userName: "user1"
        }
    ],
    team: {
        demoTeam: true,
        id: 0,
        liveChatOn: true,
        subdomain: "string"
    }
};

const group2 = {
    groupName: "group2",
    id: 0,
    members: [
        {
            id: 0,
            userName: "user2"
        }
    ],
    team: {
        demoTeam: true,
        id: 0,
        liveChatOn: true,
        subdomain: "string"
    }
};

export const getGroups = (req: Request, res: Response) => {
    console.log("getGroups headers", req.headers);
    res.json([group1, group2]);
};

export const getProjects = (req: Request, res: Response) => {
    res.writeHead(200);
    res.write("[]");
    res.end();
};