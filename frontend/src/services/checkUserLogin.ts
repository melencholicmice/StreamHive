import { config } from "../config"

export type User = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

type Response = {
    success : boolean;
    user: User | null;
}


export const checkUserLogin = async () : Promise<Response> => {
    const fetchResponse = await fetch(`${config.mediaAuthApiUrl}/users/me`, {
        method: 'GET',
        headers:{
            'Content-Type': 'application/json',
            'credentials': 'include'
        },
        credentials:'include'
    })

    if (fetchResponse.status === 200){
        const user = await fetchResponse.json();
        return {
            success:true ,
            user:user
        };

    }
    return {
        success:false,
        user:null
    };
}