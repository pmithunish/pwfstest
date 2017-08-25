import { HatchPage } from './app.po';

describe('hatch App', () => {
  let page: HatchPage;

  beforeEach(() => {
    page = new HatchPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
