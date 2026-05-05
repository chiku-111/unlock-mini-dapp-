export const MEMBERSHIP_LOCK_ABI = [
    {
        type:"function",
        name:"hasValidMembership",
        stateMutability:"view",  //Only read, not modify
        inputs:[
            {
                name:"user",
                type:"address",
            },
        ],

        outputs:[
            {
                name:"",
                type:"bool",
            },
        ],
    },
] as const; //本 ABI 是固定不变的常量，里面的字符串当成确定值
