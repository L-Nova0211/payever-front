import { take } from 'rxjs/operators';
import { observeTextMutation } from './text-mutation';

describe('Text Mutation', () => {

  it('should observe text mutation', (done) => {

    const div = document.createElement('div');

    div.style.width = '500px';
    div.style.height = '50px';
    div.style.margin = '0px auto'
    document.body.appendChild(div);

    observeTextMutation(div).pipe(take(1)).subscribe((mutations: MutationRecord[]) => {
      expect(mutations[0].addedNodes[0]).toEqual(document.createTextNode('test'));
      done();
    });

    div.innerText = 'test';

  });

});
