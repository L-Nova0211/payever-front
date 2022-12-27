import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';
import { publicEncrypt } from 'crypto';
import moment from 'moment';

import { KEY } from '../constants';

const PKCS1 = 1;

@Injectable()
export class EncryptionService {
  async encryptPassWithPubKey(pass: string): Promise<string> {
    const passDate = `${pass}|${moment.utc().valueOf()}`;
    const encryptedString = publicEncrypt(
      {
        key: KEY,
        padding: PKCS1,
      },
      Buffer.from(passDate, 'utf-8'),
    );

    return encryptedString.toString('base64');
  }
}
