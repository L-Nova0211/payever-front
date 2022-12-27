import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tagTransformer',
})
export class PeTagTransformerPipe implements PipeTransform {
  transform(content: string, usernames?: string[]) {
    if (!content) {
      return content;
    }

    if (!usernames) {
      usernames = [];
    }

    let formattedContent = content;
    let foundUsername = false;

    usernames.forEach(username => {
      const regex = new RegExp(`@${username}( |$)`, 'g');
      if (regex.test(content)) {
        foundUsername = true;
        formattedContent = formattedContent.replace(regex, ' <a class="tag">' + username + '</a> ');
      }
    });

    return foundUsername 
     ? formattedContent
     : content.replace(/<a[\s\w]+class="tag">([\s\w]+)<\/a>/g, '@$1');
  }
}
