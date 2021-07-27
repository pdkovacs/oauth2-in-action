import { Request, Response } from "express";

const group1 = {
    groupName: "VIP",
    id: 0,
    members: [
        {
            id: 0,
            userName: "alice"
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
    groupName: "CRO",
    id: 1,
    members: [
        {
            id: 0,
            userName: "carol"
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

interface  SynergyUser {
    readonly id: number;
    readonly userName: string;
}

interface SynergyProjectListResponseItem {
    readonly id: number;
    readonly team: any;
    readonly author: SynergyUser;
    readonly members: SynergyUser[];
    readonly abbreviation: string;
    readonly title: string;
    readonly externalId: string;
    readonly description: string;
    readonly conclusion: string;
    readonly status: string;
    readonly created: string;
}

const projects: SynergyProjectListResponseItem[] = [
    {
        id: 0,
        team: {
            demoTeam: true,
            id: 0,
            liveChatOn: true,
            subdomain: "string"
        },
        author: {id: 0, userName: "alice"},
        members: [{id: 0, userName: "alice"}],
        abbreviation: "P1",
        title: "Project 1",
        externalId: "0",
        description: "Project 1 desc",
        conclusion: "WTF?",
        status: "some",
        created: new Date().toString()
    }
];

export const getProjects = (req: Request, res: Response) => {
    res.json(projects);
};