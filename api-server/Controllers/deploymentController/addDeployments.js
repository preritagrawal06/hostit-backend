const { PrismaClient } = require("@prisma/client");
const { ECSClient, RunTaskCommand } = require("@aws-sdk/client-ecs");
const { updateDeploymentStatus } = require("./deploymentRepository");

const ecsClient = new ECSClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_ID,
    secretAccessKey: process.env.ACCESS_KEY,
  },
});

const prisma = new PrismaClient({});

const addDeployments = async (req, res, next) => {
    let deployment;
    try {
        const { projectId, envs } = req.body;
      
        const project = await prisma.project.findUnique({where: {id: projectId} });
      
        if (!project) {
          res.status(404).json({
            success: false,
            message: "No project found",
          });
        }
        // console.log(project);
        deployment = prisma.deployement.create({
          data: {
            project: { connect: { id: projectId } },
            status: "IN_PROGRESS",
          },
        });
      
        const command = new RunTaskCommand({
          cluster: process.env.CLUSTER,
          taskDefinition: process.env.TASK,
          count: 1,
          launchType: "FARGATE",
          networkConfiguration: {
            awsvpcConfiguration: {
              subnets: [
                "subnet-0461f1f5c2d857e60",
                "subnet-0eacef17d8bc00473",
                "subnet-0d4f015858afb0105",
              ],
              securityGroups: ["sg-0b2c3ade0046923f8"],
              assignPublicIp: "ENABLED",
            },
          },
          overrides: {
            containerOverrides: [
              {
                name: process.env.IMAGE_NAME,
                environment: [
                  ...envs,
                  {
                    name: "GIT_REPOSITORY_URL",
                    value: project.gitURL,
                  },
                  {
                    name: "PROJECT_ID",
                    value: projectId,
                  },
                  {
                    name: "DEPLOYEMENT_ID",
                    value: (await deployment).id,
                  },
                  {
                    name: "REDIS_URI",
                    value: process.env.REDIS_URI,
                  },
                  {
                    name: "ACCESS_ID",
                    value: process.env.ACCESS_ID,
                  },
                  {
                    name: "ACCESS_KEY",
                    value: process.env.ACCESS_KEY,
                  },
                  {
                    name: "REGION",
                    value: process.env.REGION,
                  },
                  {
                    name: "KAFKA_BROKER",
                    value: process.env.KAFKA_BROKER,
                  },
                  {
                    name: "KAFKA_USER",
                    value: process.env.KAFKA_USER,
                  },
                  {
                    name: "KAFKA_PASSWORD",
                    value: process.env.KAFKA_PASSWORD,
                  },
                ],
              },
            ],
          },
        });
      
        await ecsClient.send(command);
        return res.json({
          status: "IN PROGRESS",
          data: {
            deploymentId: (await deployment).id
          },
        });
        
    } catch (error) {
      if(deployment){
        const updatedDeployment = await updateDeploymentStatus((await deployment).id, "FAIL")
        console.log(updatedDeployment);
      }
      console.log(error.message);
        res.status(400).json({
            success: false,
            message: "something went wrong"
        })
    }
};

module.exports = addDeployments
