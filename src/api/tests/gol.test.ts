import { createTestContext } from './__helpers';

const ctx = createTestContext({ portRange: { from: 4000, to: 6000 } });

import { NexusGenFieldTypes } from '../../generated/nexus-typegen';

it('it signs in as task manager role', async () => {

  const requestSignIn: NexusGenFieldTypes["Mutation"] = await ctx.client.request(`
      mutation SigninTMRole($nodeId: String!, $nodeName: String!) {
      signinTMRole(nodeId: $nodeId, nodeName: $nodeName) {
        granted
        message
      }
    } `, {
    "nodeId": "5010",
    "nodeName": "Orange"
  });

  expect(requestSignIn.signinTMRole).toMatchInlineSnapshot(`
{
  "granted": true,
  "message": "Successfully granted to become task manager.",
}
`);

  const requestSignOut: NexusGenFieldTypes["Mutation"] = await ctx.client.request(`
      mutation SignoutTMRole($nodeId: String!) {
      signoutTMRole(nodeId: $nodeId) {
        granted
        message
      }
    } `, {
    "nodeId": "5010",
  });

  expect(requestSignOut.signinTMRole).toMatchInlineSnapshot(`undefined`);


});
