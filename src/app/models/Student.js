import Sequelize, { Model } from 'sequelize';
import { differenceInYears } from 'date-fns';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        birth_date: Sequelize.DATE,
        years_old: {
          type: Sequelize.VIRTUAL,
          get() {
            return differenceInYears(new Date(), this.birth_date);
          },
        },
        weight: Sequelize.DOUBLE,
        height: Sequelize.DOUBLE,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Student;
