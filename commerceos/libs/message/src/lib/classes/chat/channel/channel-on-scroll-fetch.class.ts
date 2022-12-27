import { v4 as uuid } from 'uuid';

export class ScrollFetchData{

    counter = 1;
    uuid =  uuid();
    onLoading = false;
    hasNext = true;
    skip = 1;
}