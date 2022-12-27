import { PeTagTransformerPipe } from "./"
describe('PeTagTransformerPipe', () => {
    const pipe = new PeTagTransformerPipe();

    // FIRST CASE @ -> <a>
    it('transforms "@Ben" to " <a class="tag">Ben</a> "', () => {
        expect(pipe.transform('@Ben', ['Ben'])).toBe(' <a class="tag">Ben</a> ');
    })

    it('transforms "@Ben @Ben" to " <a class="tag">Ben</a> <a class="tag">Ben</a> "', () => {
        expect(pipe.transform('@Ben @Ben', ['Ben'])).toBe(' <a class="tag">Ben</a>  <a class="tag">Ben</a> ');
    })

    it('transforms "TEST@Ben" to "TEST <a class="tag">Ben</a> "', () => {
        expect(pipe.transform('TEST@Ben', ['Ben'])).toBe('TEST <a class="tag">Ben</a> ');
    })

    it('doesn`t transform "@BenTEST"', () => {
        expect(pipe.transform('@BenTEST', ['Ben'])).toBe('@BenTEST');
    })

    it('transforms "@Ben @Mike" to " <a class="tag">Ben</a>  <a class="tag">Mike</a> "', () => {
        expect(pipe.transform('@Ben @Mike', ['Ben', 'Mike'])).toBe(' <a class="tag">Ben</a>  <a class="tag">Mike</a> ');
    })
    
    // SECOND CASE <a> -> @
    it('transforms "<a class="tag">Ben</a>" to "@Ben"', () => {
        expect(pipe.transform('<a class="tag">Ben</a>')).toBe('@Ben');
    })

    it('transforms "TEST<a class="tag">Ben</a>" to "TEST@Ben"', () => {
        expect(pipe.transform('TEST<a class="tag">Ben</a>')).toBe('TEST@Ben');
    })

    it('transforms "<a class="tag">Ben</a> <a class="tag">Mike</a>" to "@Ben @Mike"', () => {
        expect(pipe.transform('<a class="tag">Ben</a> <a class="tag">Mike</a>')).toBe('@Ben @Mike');
    })

    it('transforms "TEST<a class="tag">Ben</a>TEST TEST<a class="tag">Mike</a>  TEST" to "TEST@BenTEST TEST@Mike  TEST"', () => {
        expect(pipe.transform('TEST<a class="tag">Ben</a>TEST TEST<a class="tag">Mike</a>  TEST')).toBe('TEST@BenTEST TEST@Mike  TEST');
    })
})
