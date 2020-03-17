// Object under test
import { Oauth } from './oauth';

it('Oauth returns string value as expected', () => {
  expect(Oauth()).toBe('Service Oauth created');
});