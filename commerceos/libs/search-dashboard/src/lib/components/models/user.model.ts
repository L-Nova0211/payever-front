export interface BusinessSpotlightInterface {
    _id: string;
    title: string;
    description: string;
    icon: string;
    owner: OwnerInterface;
    ownerId: string;
}

export interface OwnerInterface {
    email: string;
    userId: string;
    fullName: string;
}