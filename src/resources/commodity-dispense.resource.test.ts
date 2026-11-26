import { dispenseErrorMessage } from './commodity-dispense.resource';

describe('dispenseErrorMessage', () => {
  it('prefers the rule violation from globalErrors', () => {
    const error = {
      message: 'Bad request',
      responseBody: {
        error: {
          message: 'Invalid Submission',
          globalErrors: [{ message: 'Dispensing 4 would exceed the ordered quantity of 4' }],
          fieldErrors: {},
        },
      },
    };
    expect(dispenseErrorMessage(error)).toBe('Dispensing 4 would exceed the ordered quantity of 4');
  });

  it('falls back to the first field error, then the REST message, then the error message', () => {
    expect(
      dispenseErrorMessage({
        responseBody: { error: { message: 'Invalid Submission', fieldErrors: { quantity: [{ message: 'Too small' }] } } },
      }),
    ).toBe('Too small');
    expect(dispenseErrorMessage({ responseBody: { error: { message: 'Server error' } } })).toBe('Server error');
    expect(dispenseErrorMessage(new Error('Network down'))).toBe('Network down');
  });
});
